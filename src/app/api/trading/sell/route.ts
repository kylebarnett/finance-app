import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { PaperAccount, Holding } from "@/lib/types/database";
import { checkTradingAchievements, checkPortfolioAchievements } from "@/lib/achievements/checker";
import {
  roundCurrency,
  calculateTotalCost,
  isValidPrice,
  isValidQuantity,
  checkRateLimit,
  checkDailyTradeLimit,
  incrementDailyTradeCount,
  MAX_SHARES_PER_TRADE,
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
        { success: false, error: "You need to be logged in to sell stocks" },
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
    tradeKey = generateTradeKey(user.id, upperSymbol, "SELL", quantity);
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

    // Get user's paper account
    const { data: paperAccount, error: accountError } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (accountError || !paperAccount) {
      markTradeFailed(tradeKey);
      return NextResponse.json(
        { success: false, error: "You don't have a trading account yet. Buy some stocks first!" },
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
      markTradeFailed(tradeKey);
      return NextResponse.json(
        { success: false, error: `You don't own any shares of ${upperSymbol}!` },
        { status: 400 }
      );
    }

    const holding = existingHolding as Holding;

    // Check if user has enough shares
    if (holding.quantity < quantity) {
      markTradeFailed(tradeKey);
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
      markTradeFailed(tradeKey);
      return NextResponse.json(
        { success: false, error: `We couldn't get the current price for "${upperSymbol}"` },
        { status: 500 }
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
    const totalProceeds = calculateTotalCost(currentPrice, quantity);
    const costBasis = roundCurrency(holding.average_cost * quantity);
    const realizedGain = roundCurrency(totalProceeds - costBasis);

    // === BEGIN TRANSACTION-LIKE OPERATIONS ===
    let transactionCreated = false;
    let holdingUpdated = false;
    let cashUpdated = false;

    // Step 1: Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        paper_account_id: account.id,
        symbol: upperSymbol,
        transaction_type: "SELL",
        quantity,
        price_per_share: roundCurrency(currentPrice),
        total_amount: totalProceeds,
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

    // Step 2: Update or delete holding
    const remainingQuantity = holding.quantity - quantity;

    if (remainingQuantity === 0) {
      // Delete the holding if selling all shares
      const { error: deleteError } = await supabase
        .from("holdings")
        .delete()
        .eq("id", holding.id);

      if (deleteError) {
        console.error("Holding delete error:", deleteError);
        markTradeFailed(tradeKey);
        return NextResponse.json(
          {
            success: false,
            error: "Trade partially completed. Transaction recorded but couldn't remove holding. Please contact support.",
            details: { transactionCreated, holdingUpdated: false, cashUpdated: false }
          },
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
        markTradeFailed(tradeKey);
        return NextResponse.json(
          {
            success: false,
            error: "Trade partially completed. Transaction recorded but holdings weren't updated. Please contact support.",
            details: { transactionCreated, holdingUpdated: false, cashUpdated: false }
          },
          { status: 500 }
        );
      }
    }
    holdingUpdated = true;

    // Step 3: Update cash balance
    const newCashBalance = roundCurrency(account.current_cash + totalProceeds);
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
          error: "Trade partially completed. Shares sold but cash wasn't added to your balance. Please contact support.",
          details: { transactionCreated, holdingUpdated, cashUpdated: false }
        },
        { status: 500 }
      );
    }
    cashUpdated = true;

    // === END TRANSACTION-LIKE OPERATIONS ===

    // Increment daily trade count
    incrementDailyTradeCount(user.id);

    // Build success message
    const gainMessage = realizedGain >= 0
      ? `You made $${realizedGain.toFixed(2)} profit on this trade!`
      : `You lost $${Math.abs(realizedGain).toFixed(2)} on this trade. That's okay - it's all part of learning!`;

    // Check for newly unlocked achievements (non-critical)
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
        message: `Nice trade! You sold ${quantity} share${quantity > 1 ? "s" : ""} of ${quote.shortName || upperSymbol}! ${gainMessage}`,
        transaction: {
          symbol: upperSymbol,
          quantity,
          pricePerShare: roundCurrency(currentPrice),
          totalProceeds,
          realizedGain,
        },
        holding: remainingQuantity > 0 ? {
          symbol: upperSymbol,
          remainingShares: remainingQuantity,
          averageCost: holding.average_cost,
        } : null,
        newCashBalance,
        achievements: newlyUnlocked.length > 0 ? newlyUnlocked : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    // Cache the successful result for idempotency
    markTradeCompleted(tradeKey, successResponse);

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Sell order error:", error);
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
