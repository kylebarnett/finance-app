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
        { success: false, error: "You need to be logged in to sell stocks" },
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

    // Check if user owns this stock
    const { data: existingHolding, error: holdingError } = await supabase
      .from("holdings")
      .select("*")
      .eq("paper_account_id", account.id)
      .eq("symbol", upperSymbol)
      .single();

    if (holdingError || !existingHolding) {
      return NextResponse.json(
        { success: false, error: `You don't own any shares of ${upperSymbol}!` },
        { status: 400 }
      );
    }

    const holding = existingHolding as Holding;

    // Check if user has enough shares
    if (holding.quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `You only have ${holding.quantity} share${holding.quantity > 1 ? "s" : ""} of ${upperSymbol}. You can't sell ${quantity}!`,
          details: {
            sharesOwned: holding.quantity,
            attemptedSell: quantity,
          }
        },
        { status: 400 }
      );
    }

    // Fetch current stock price
    let quote;
    try {
      quote = await yahooFinance.quote(upperSymbol);
    } catch {
      return NextResponse.json(
        { success: false, error: `We couldn't get the current price for "${upperSymbol}"` },
        { status: 500 }
      );
    }

    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json(
        { success: false, error: `We couldn't find the price for "${upperSymbol}"` },
        { status: 500 }
      );
    }

    const currentPrice = quote.regularMarketPrice;
    const totalProceeds = currentPrice * quantity;
    const costBasis = holding.average_cost * quantity;
    const realizedGain = totalProceeds - costBasis;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        paper_account_id: account.id,
        symbol: upperSymbol,
        transaction_type: "SELL",
        quantity,
        price_per_share: currentPrice,
        total_amount: totalProceeds,
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to record transaction" },
        { status: 500 }
      );
    }

    // Update or delete holding
    const remainingQuantity = holding.quantity - quantity;

    if (remainingQuantity === 0) {
      // Delete the holding if selling all shares
      const { error: deleteError } = await supabase
        .from("holdings")
        .delete()
        .eq("id", holding.id);

      if (deleteError) {
        console.error("Holding delete error:", deleteError);
        return NextResponse.json(
          { success: false, error: "Failed to update holding" },
          { status: 500 }
        );
      }
    } else {
      // Update the holding with remaining shares (average cost stays the same)
      const { error: updateError } = await supabase
        .from("holdings")
        .update({ quantity: remainingQuantity })
        .eq("id", holding.id);

      if (updateError) {
        console.error("Holding update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to update holding" },
          { status: 500 }
        );
      }
    }

    // Update cash balance
    const newCashBalance = account.current_cash + totalProceeds;
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

    // Build success message
    const gainMessage = realizedGain >= 0
      ? `You made $${realizedGain.toFixed(2)} profit on this trade!`
      : `You lost $${Math.abs(realizedGain).toFixed(2)} on this trade. That's okay - it's all part of learning!`;

    return NextResponse.json({
      success: true,
      data: {
        message: `Nice trade! You sold ${quantity} share${quantity > 1 ? "s" : ""} of ${quote.shortName || upperSymbol}! ${gainMessage}`,
        transaction: {
          symbol: upperSymbol,
          quantity,
          pricePerShare: currentPrice,
          totalProceeds,
          realizedGain,
        },
        holding: remainingQuantity > 0 ? {
          symbol: upperSymbol,
          remainingShares: remainingQuantity,
          averageCost: holding.average_cost,
        } : null,
        newCashBalance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sell order error:", error);
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
