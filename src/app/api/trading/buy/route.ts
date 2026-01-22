import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { PaperAccount, Holding } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to buy stocks" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { symbol, quantity } = body;

    // Validate inputs
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a stock symbol" },
        { status: 400 }
      );
    }

    if (!quantity || typeof quantity !== "number" || quantity < 1 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { success: false, error: "Please enter a whole number of shares (at least 1)" },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // Get user's paper account
    const { data: paperAccount, error: accountError } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (accountError || !paperAccount) {
      return NextResponse.json(
        { success: false, error: "Paper account not found" },
        { status: 404 }
      );
    }

    const account = paperAccount as PaperAccount;

    // Fetch current stock price
    let quote;
    try {
      quote = await yahooFinance.quote(upperSymbol);
    } catch {
      return NextResponse.json(
        { success: false, error: `We couldn't find a stock called "${upperSymbol}"` },
        { status: 404 }
      );
    }

    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json(
        { success: false, error: `We couldn't find the price for "${upperSymbol}"` },
        { status: 404 }
      );
    }

    const currentPrice = quote.regularMarketPrice;
    const totalCost = currentPrice * quantity;

    // Check if user has enough cash
    if (account.current_cash < totalCost) {
      const shortfall = totalCost - account.current_cash;
      return NextResponse.json(
        {
          success: false,
          error: `You need $${shortfall.toFixed(2)} more to buy this. Try fewer shares!`,
          details: {
            cashAvailable: account.current_cash,
            totalCost,
            shortfall,
          }
        },
        { status: 400 }
      );
    }

    // Check if user already has this holding
    const { data: existingHolding } = await supabase
      .from("holdings")
      .select("*")
      .eq("paper_account_id", account.id)
      .eq("symbol", upperSymbol)
      .single();

    const holding = existingHolding as Holding | null;

    // Calculate new average cost if adding to existing position
    let newQuantity: number;
    let newAverageCost: number;

    if (holding) {
      newQuantity = holding.quantity + quantity;
      newAverageCost = ((holding.quantity * holding.average_cost) + (quantity * currentPrice)) / newQuantity;
    } else {
      newQuantity = quantity;
      newAverageCost = currentPrice;
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        paper_account_id: account.id,
        symbol: upperSymbol,
        transaction_type: "BUY",
        quantity,
        price_per_share: currentPrice,
        total_amount: totalCost,
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to record transaction" },
        { status: 500 }
      );
    }

    // Update or insert holding
    if (holding) {
      const { error: holdingError } = await supabase
        .from("holdings")
        .update({
          quantity: newQuantity,
          average_cost: newAverageCost,
        })
        .eq("id", holding.id);

      if (holdingError) {
        console.error("Holding update error:", holdingError);
        return NextResponse.json(
          { success: false, error: "Failed to update holding" },
          { status: 500 }
        );
      }
    } else {
      const { error: holdingError } = await supabase
        .from("holdings")
        .insert({
          paper_account_id: account.id,
          symbol: upperSymbol,
          quantity: newQuantity,
          average_cost: newAverageCost,
        });

      if (holdingError) {
        console.error("Holding insert error:", holdingError);
        return NextResponse.json(
          { success: false, error: "Failed to create holding" },
          { status: 500 }
        );
      }
    }

    // Update cash balance
    const newCashBalance = account.current_cash - totalCost;
    const { error: cashError } = await supabase
      .from("paper_accounts")
      .update({ current_cash: newCashBalance })
      .eq("id", account.id);

    if (cashError) {
      console.error("Cash update error:", cashError);
      return NextResponse.json(
        { success: false, error: "Failed to update cash balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Awesome! You bought ${quantity} share${quantity > 1 ? "s" : ""} of ${quote.shortName || upperSymbol}!`,
        transaction: {
          symbol: upperSymbol,
          quantity,
          pricePerShare: currentPrice,
          totalCost,
        },
        holding: {
          symbol: upperSymbol,
          totalShares: newQuantity,
          averageCost: newAverageCost,
        },
        newCashBalance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Buy order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong with your order. Please try again!",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
