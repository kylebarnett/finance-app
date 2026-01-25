import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { LeaderboardEntry } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

// Fun avatar emojis for leaderboard
const avatarEmojis = ["🦊", "🐻", "🐼", "🦁", "🐯", "🐨", "🐸", "🦉", "🦋", "🐢", "🦄", "🐙", "🦀", "🐳", "🦈", "🐬", "🦩", "🦚", "🐝", "🦔"];

function getAvatarEmoji(userId: string): string {
  // Use user ID to consistently pick an emoji
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return avatarEmojis[Math.abs(hash) % avatarEmojis.length];
}

// GET - Public leaderboard (only users who opted in)
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all users who opted into the public leaderboard
    const { data: optedInUsers, error: settingsError } = await supabase
      .from("leaderboard_settings")
      .select("user_id, display_name_override")
      .eq("show_on_public_leaderboard", true);

    if (settingsError) {
      console.error("Leaderboard settings error:", settingsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    if (!optedInUsers || optedInUsers.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No one has joined the leaderboard yet! Be the first!",
        timestamp: new Date().toISOString(),
      });
    }

    // Get paper accounts and holdings for opted-in users
    const userIds = optedInUsers.map(u => u.user_id);

    const { data: paperAccounts, error: accountsError } = await supabase
      .from("paper_accounts")
      .select("user_id, starting_cash, current_cash")
      .in("user_id", userIds);

    if (accountsError) {
      console.error("Paper accounts error:", accountsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch portfolio data" },
        { status: 500 }
      );
    }

    const { data: allHoldings, error: holdingsError } = await supabase
      .from("holdings")
      .select("user_id, symbol, quantity, average_cost")
      .in("user_id", userIds);

    if (holdingsError) {
      console.error("Holdings error:", holdingsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch holdings data" },
        { status: 500 }
      );
    }

    // Get trade counts
    const { data: tradeCounts, error: tradesError } = await supabase
      .from("trades")
      .select("user_id")
      .in("user_id", userIds);

    if (tradesError) {
      console.error("Trades error:", tradesError);
    }

    // Count trades per user
    const tradeCountMap: Record<string, number> = {};
    (tradeCounts || []).forEach(trade => {
      tradeCountMap[trade.user_id] = (tradeCountMap[trade.user_id] || 0) + 1;
    });

    // Get user profiles for display names
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap: Record<string, string> = {};
    (profiles || []).forEach(p => {
      profileMap[p.id] = p.full_name || "Investor";
    });

    // Fetch live prices for all unique symbols
    const allSymbols = [...new Set((allHoldings || []).map(h => h.symbol))];
    let prices: Record<string, number> = {};

    if (allSymbols.length > 0) {
      try {
        const quoteResults = await yahooFinance.quote(allSymbols);
        const quotesArray = Array.isArray(quoteResults) ? quoteResults : [quoteResults];

        for (const quote of quotesArray) {
          if (quote && quote.symbol) {
            prices[quote.symbol] = quote.regularMarketPrice ?? 0;
          }
        }
      } catch (error) {
        console.error("Failed to fetch live prices for leaderboard:", error);
      }
    }

    // Calculate total value for each user
    const leaderboardData: LeaderboardEntry[] = [];

    for (const optedUser of optedInUsers) {
      const account = paperAccounts?.find(a => a.user_id === optedUser.user_id);
      if (!account) continue;

      const userHoldings = (allHoldings || []).filter(h => h.user_id === optedUser.user_id);

      // Calculate holdings value
      let holdingsValue = 0;
      for (const holding of userHoldings) {
        const price = prices[holding.symbol] || holding.average_cost;
        holdingsValue += holding.quantity * price;
      }

      const totalValue = account.current_cash + holdingsValue;
      const gainLossPercent = ((totalValue - account.starting_cash) / account.starting_cash) * 100;

      // Get display name
      let displayName = optedUser.display_name_override || profileMap[optedUser.user_id] || "Anonymous Investor";

      // Anonymize slightly for privacy - show first name or initial
      if (!optedUser.display_name_override && displayName !== "Anonymous Investor") {
        const firstName = displayName.split(" ")[0];
        displayName = firstName.length > 10 ? firstName.substring(0, 10) + "..." : firstName;
      }

      leaderboardData.push({
        rank: 0, // Will be set after sorting
        user_id: optedUser.user_id,
        display_name: displayName,
        avatar_emoji: getAvatarEmoji(optedUser.user_id),
        total_value: totalValue,
        gain_loss_percent: gainLossPercent,
        trade_count: tradeCountMap[optedUser.user_id] || 0,
      });
    }

    // Sort by total value (descending) and assign ranks
    leaderboardData.sort((a, b) => b.total_value - a.total_value);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
