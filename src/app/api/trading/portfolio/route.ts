import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { Holding, PaperAccount } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

// Company emojis for display
const companyEmojis: Record<string, string> = {
  AAPL: "🍎",
  GOOGL: "🔍",
  GOOG: "🔍",
  MSFT: "🪟",
  AMZN: "📦",
  TSLA: "🚗",
  META: "👥",
  NVDA: "🎮",
  DIS: "🏰",
  NKE: "👟",
  MCD: "🍔",
  NFLX: "🎬",
  SBUX: "☕",
  COST: "🛒",
  WMT: "🏪",
  JPM: "🏦",
  V: "💳",
  MA: "💳",
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to view your portfolio" },
        { status: 401 }
      );
    }

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

    // Get user's holdings
    const { data: holdingsData, error: holdingsError } = await supabase
      .from("holdings")
      .select("*")
      .eq("paper_account_id", account.id);

    if (holdingsError) {
      console.error("Holdings fetch error:", holdingsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch holdings" },
        { status: 500 }
      );
    }

    const holdings = (holdingsData || []) as Holding[];

    // If no holdings, return just cash
    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalValue: account.current_cash,
            cashBalance: account.current_cash,
            holdingsValue: 0,
            totalGainLoss: account.current_cash - account.starting_balance,
            totalGainLossPercent: ((account.current_cash - account.starting_balance) / account.starting_balance) * 100,
            startingBalance: account.starting_balance,
          },
          holdings: [],
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch live prices for all holdings
    const symbols = holdings.map(h => h.symbol);
    let quotes: Record<string, { price: number; name: string }> = {};

    try {
      const quoteResults = await yahooFinance.quote(symbols);
      const quotesArray = Array.isArray(quoteResults) ? quoteResults : [quoteResults];

      for (const quote of quotesArray) {
        if (quote && quote.symbol) {
          quotes[quote.symbol] = {
            price: quote.regularMarketPrice ?? 0,
            name: quote.shortName || quote.longName || quote.symbol,
          };
        }
      }
    } catch (error) {
      console.error("Failed to fetch live prices:", error);
      // Continue with zeros if quotes fail
    }

    // Calculate holdings with live data
    let holdingsValue = 0;
    const enrichedHoldings = holdings.map(holding => {
      const quote = quotes[holding.symbol] || { price: 0, name: holding.symbol };
      const currentValue = holding.quantity * quote.price;
      const costBasis = holding.quantity * holding.average_cost;
      const gainLoss = currentValue - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      holdingsValue += currentValue;

      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        averageCost: holding.average_cost,
        currentPrice: quote.price,
        currentValue,
        gainLoss,
        gainLossPercent,
        companyName: quote.name,
        emoji: companyEmojis[holding.symbol] || "🏢",
      };
    });

    // Calculate totals
    const totalValue = account.current_cash + holdingsValue;
    const totalGainLoss = totalValue - account.starting_balance;
    const totalGainLossPercent = (totalGainLoss / account.starting_balance) * 100;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalValue,
          cashBalance: account.current_cash,
          holdingsValue,
          totalGainLoss,
          totalGainLossPercent,
          startingBalance: account.starting_balance,
        },
        holdings: enrichedHoldings,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
