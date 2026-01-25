import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { LeaderboardEntry } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

// Fun avatar emojis for leaderboard
const avatarEmojis = ["🦊", "🐻", "🐼", "🦁", "🐯", "🐨", "🐸", "🦉", "🦋", "🐢", "🦄", "🐙", "🦀", "🐳", "🦈", "🐬", "🦩", "🦚", "🐝", "🦔"];

function getAvatarEmoji(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return avatarEmojis[Math.abs(hash) % avatarEmojis.length];
}

// GET - Get group-specific leaderboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient();
    const { groupId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in" },
        { status: 401 }
      );
    }

    // Check if user is a member
    const { data: membership } = await supabase
      .from("friend_group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "You're not a member of this group" },
        { status: 403 }
      );
    }

    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from("friend_group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (membersError || !members || members.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    const memberIds = members.map(m => m.user_id);

    // Get paper accounts for all members
    const { data: paperAccounts, error: accountsError } = await supabase
      .from("paper_accounts")
      .select("user_id, starting_cash, current_cash")
      .in("user_id", memberIds);

    if (accountsError) {
      console.error("Paper accounts error:", accountsError);
    }

    // Get holdings for all members
    const { data: allHoldings, error: holdingsError } = await supabase
      .from("holdings")
      .select("user_id, symbol, quantity, average_cost")
      .in("user_id", memberIds);

    if (holdingsError) {
      console.error("Holdings error:", holdingsError);
    }

    // Get trade counts
    const { data: tradeCounts } = await supabase
      .from("trades")
      .select("user_id")
      .in("user_id", memberIds);

    const tradeCountMap: Record<string, number> = {};
    (tradeCounts || []).forEach(trade => {
      tradeCountMap[trade.user_id] = (tradeCountMap[trade.user_id] || 0) + 1;
    });

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", memberIds);

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
        console.error("Failed to fetch live prices:", error);
      }
    }

    // Calculate rankings
    const leaderboardData: LeaderboardEntry[] = [];

    for (const memberId of memberIds) {
      const account = paperAccounts?.find(a => a.user_id === memberId);

      // Use default starting values if no account exists yet
      const startingCash = account?.starting_cash ?? 10000;
      const currentCash = account?.current_cash ?? 10000;

      const userHoldings = (allHoldings || []).filter(h => h.user_id === memberId);

      let holdingsValue = 0;
      for (const holding of userHoldings) {
        const price = prices[holding.symbol] || holding.average_cost;
        holdingsValue += holding.quantity * price;
      }

      const totalValue = currentCash + holdingsValue;
      const gainLossPercent = ((totalValue - startingCash) / startingCash) * 100;

      // Get display name - use first name for privacy
      let displayName = profileMap[memberId] || "Investor";
      const firstName = displayName.split(" ")[0];
      displayName = firstName.length > 12 ? firstName.substring(0, 12) + "..." : firstName;

      leaderboardData.push({
        rank: 0,
        user_id: memberId,
        display_name: displayName,
        avatar_emoji: getAvatarEmoji(memberId),
        total_value: totalValue,
        gain_loss_percent: gainLossPercent,
        trade_count: tradeCountMap[memberId] || 0,
      });
    }

    // Sort and assign ranks
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
    console.error("Group leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
