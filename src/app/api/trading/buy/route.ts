import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { PaperAccount, Holding } from "@/lib/types/database";
import { checkTradingAchievements, checkPortfolioAchievements } from "@/lib/achievements/checker";
import {
  roundCurrency,
  calculateTotalCost,
  calculateNewAverageCost,
  isValidPrice,
  isValidQuantity,
  checkRateLimit,
  checkDailyTradeLimit,
  incrementDailyTradeCount,
  checkTradeValueLimit,
  STARTING_CASH,
  MAX_SHARES_PER_TRADE,
  MAX_TRADE_VALUE,
} from "@/lib/trading/utils";
import {
  checkIdempotency,
  markTradePending,
  markTradeCompleted,
  markTradeFailed,
  generateTradeKey,
} from "@/lib/trading/idempotency";

const yahooFinance = new YahooFinance();

export async function POST(request: NextRequest) {
  let tradeKey: string | null = null;

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

    // Rate limiting - max 10 trades per minute
    if (!checkRateLimit(user.id, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: "Slow down! You're trading too fast. Wait a minute and try again." },
        { status: 429 }
      );
    }

    // Daily trade limit check
    const dailyLimit = checkDailyTradeLimit(user.id);
    if (!dailyLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "You've reached your daily trading limit! Come back tomorrow to trade more.",
          details: { reason: "daily_limit_reached" }
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { symbol, quantity } = body;

    // Validate symbol
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a stock symbol" },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase().trim();

    if (upperSymbol.length > 10) {
      return NextResponse.json(
        { success: false, error: "Invalid stock symbol" },
        { status: 400 }
      );
    }

    // Validate quantity
    if (!isValidQuantity(quantity)) {
      return NextResponse.json(
        { success: false, error: `Please enter a whole number between 1 and ${MAX_SHARES_PER_TRADE} shares` },
        { status: 400 }
      );
    }

    // Check for duplicate trade (idempotency)
    tradeKey = generateTradeKey(user.id, upperSymbol, "BUY", quantity);
    const { isDuplicate, existingResult } = checkIdempotency(tradeKey);

    if (isDuplicate) {
      if (existingResult) {
        // Return the cached successful result
        return NextResponse.json(existingResult);
      }
      return NextResponse.json(
        { success: false, error: "This trade is already being processed. Please wait." },
        { status: 409 }
      );
    }

    // Mark trade as pending
    markTradePending(tradeKey);

    // Get or create user's paper account
    let { data: paperAccount } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Create paper account if it doesn't exist
    if (!paperAccount) {
      const { data: newAccount, error: createError } = await supabase
        .from("paper_accounts")
        .insert({
          user_id: user.id,
          starting_cash: STARTING_CASH,
          current_cash: STARTING_CASH,
        })
        .select()
        .single();

      if (createError || !newAccount) {
        console.error("Paper account creation error:", createError);
        markTradeFailed(tradeKey);
        return NextResponse.json(
          { success: false, error: "Failed to create paper account" },
          { status: 500 }
        );
      }
      paperAccount = newAccount;
    }

    const account = paperAccount as PaperAccount;

    // Fetch current stock price
    let quote;
    try {
      quote = await yahooFinance.quote(upperSymbol);
    } catch {
      markTradeFailed(tradeKey);
      return NextResponse.json(
        { success: false, error: `We couldn't find a stock called "${upperSymbol}"` },
        { status: 404 }
      );
    }

    // Validate price - CRITICAL: reject if price is invalid
    if (!isValidPrice(quote?.regularMarketPrice)) {
      markTradeFailed(tradeKey);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to get a valid price for this stock right now. Please try again later.",
          details: { reason: "price_unavailable" }
        },
        { status: 503 }
      );
    }

    const currentPrice = quote.regularMarketPrice;
    const totalCost = calculateTotalCost(currentPrice, quantity);

    // Check trade value limit (parental control)
    const valueLimit = checkTradeValueLimit(totalCost);
    if (!valueLimit.allowed) {
      markTradeFailed(tradeKey);
      return NextResponse.json(
        {
          success: false,
          error: `This trade is too big! The maximum per trade is $${MAX_TRADE_VALUE.toLocaleString()}. Try buying fewer shares.`,
          details: {
            totalCost,
            maxAllowed: MAX_TRADE_VALUE,
          }
        },
        { status: 400 }
      );
    }

    // Check if user has enough cash (with small buffer for rounding)
    if (account.current_cash < totalCost - 0.01) {
      const shortfall = roundCurrency(totalCost - account.current_cash);
      markTradeFailed(tradeKey);
      return NextResponse.json(
        {
          success: false,
          error: `You need $${shortfall.toFixed(2)} more to buy this. Try fewer shares!`,
          details: {
            cashAvailable: roundCurrency(account.current_cash),
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
      newAverageCost = calculateNewAverageCost(
        holding.quantity,
        holding.average_cost,
        quantity,
        currentPrice
      );
    } else {
      newQuantity = quantity;
      newAverageCost = currentPrice;
    }

    // === BEGIN TRANSACTION-LIKE OPERATIONS ===
    // We'll track what succeeded so we can report accurately on failure

    let transactionCreated = false;
    let holdingUpdated = false;
    let cashUpdated = false;

    // Step 1: Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        paper_account_id: account.id,
        symbol: upperSymbol,
        transaction_type: "BUY",
        quantity,
        price_per_share: roundCurrency(currentPrice),
        total_amount: totalCost,
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      markTradeFailed(tradeKey);
      return NextResponse.json(
        { success: false, error: "Failed to record transaction. No changes were made." },
        { status: 500 }
      );
    }
    transactionCreated = true;

    // Step 2: Update or insert holding
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
        // Transaction was created but holding failed - inform user
        markTradeFailed(tradeKey);
        return NextResponse.json(
          {
            success: false,
            error: "Trade partially completed. Your transaction was recorded but holdings weren't updated. Please contact support.",
            details: { transactionCreated, holdingUpdated: false, cashUpdated: false }
          },
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
        markTradeFailed(tradeKey);
        return NextResponse.json(
          {
            success: false,
            error: "Trade partially completed. Your transaction was recorded but holdings weren't created. Please contact support.",
            details: { transactionCreated, holdingUpdated: false, cashUpdated: false }
          },
          { status: 500 }
        );
      }
    }
    holdingUpdated = true;

    // Step 3: Update cash balance
    const newCashBalance = roundCurrency(account.current_cash - totalCost);
    const { error: cashError } = await supabase
      .from("paper_accounts")
      .update({ current_cash: newCashBalance })
      .eq("id", account.id);

    if (cashError) {
      console.error("Cash update error:", cashError);
      markTradeFailed(tradeKey);
      return NextResponse.json(
        {
          success: false,
          error: "Trade partially completed. You own the shares but your cash balance wasn't updated. Please contact support.",
          details: { transactionCreated, holdingUpdated, cashUpdated: false }
        },
        { status: 500 }
      );
    }
    cashUpdated = true;

    // === END TRANSACTION-LIKE OPERATIONS ===

    // Increment daily trade count
    incrementDailyTradeCount(user.id);

    // Check for newly unlocked achievements (non-critical, don't fail trade if this errors)
    let newlyUnlocked: unknown[] = [];
    try {
      const [tradingResult, portfolioResult] = await Promise.all([
        checkTradingAchievements(user.id),
        checkPortfolioAchievements(user.id),
      ]);
      newlyUnlocked = [
        ...tradingResult.newlyUnlocked,
        ...portfolioResult.newlyUnlocked,
      ];
    } catch (achievementError) {
      console.error("Achievement check error (non-fatal):", achievementError);
    }

    const successResponse = {
      success: true,
      data: {
        message: `Awesome! You bought ${quantity} share${quantity > 1 ? "s" : ""} of ${quote.shortName || upperSymbol}!`,
        transaction: {
          symbol: upperSymbol,
          quantity,
          pricePerShare: roundCurrency(currentPrice),
          totalCost,
        },
        holding: {
          symbol: upperSymbol,
          totalShares: newQuantity,
          averageCost: newAverageCost,
        },
        newCashBalance,
        achievements: newlyUnlocked.length > 0 ? newlyUnlocked : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    // Cache the successful result for idempotency
    markTradeCompleted(tradeKey, successResponse);

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Buy order error:", error);
    if (tradeKey) {
      markTradeFailed(tradeKey);
    }
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
