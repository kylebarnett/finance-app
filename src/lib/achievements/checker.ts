import { createClient } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface CheckResult {
  newlyUnlocked: Achievement[];
  alreadyUnlocked: string[];
}

// Achievement slugs and their check functions
const ACHIEVEMENT_CHECKS: Record<string, (userId: string, supabase: SupabaseClient) => Promise<boolean>> = {
  // Trading achievements
  first_trade: async (userId, supabase) => {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("paper_account_id", await getPaperAccountId(userId, supabase));
    return (count || 0) >= 1;
  },

  ten_trades: async (userId, supabase) => {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("paper_account_id", await getPaperAccountId(userId, supabase));
    return (count || 0) >= 10;
  },

  fifty_trades: async (userId, supabase) => {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("paper_account_id", await getPaperAccountId(userId, supabase));
    return (count || 0) >= 50;
  },

  hundred_trades: async (userId, supabase) => {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("paper_account_id", await getPaperAccountId(userId, supabase));
    return (count || 0) >= 100;
  },

  first_profit: async (userId, supabase) => {
    const accountId = await getPaperAccountId(userId, supabase);
    // Check if any SELL transaction resulted in profit
    // We check if the sell price > average cost from holdings at time of sale
    const { data: sells } = await supabase
      .from("transactions")
      .select("symbol, price_per_share, quantity")
      .eq("paper_account_id", accountId)
      .eq("transaction_type", "SELL");

    if (!sells || sells.length === 0) return false;

    // Get all buy transactions to calculate average costs
    const { data: buys } = await supabase
      .from("transactions")
      .select("symbol, price_per_share, quantity")
      .eq("paper_account_id", accountId)
      .eq("transaction_type", "BUY");

    if (!buys) return false;

    // Calculate average cost per symbol
    const avgCosts: Record<string, { totalCost: number; totalQty: number }> = {};
    for (const buy of buys) {
      if (!avgCosts[buy.symbol]) {
        avgCosts[buy.symbol] = { totalCost: 0, totalQty: 0 };
      }
      avgCosts[buy.symbol].totalCost += buy.price_per_share * buy.quantity;
      avgCosts[buy.symbol].totalQty += buy.quantity;
    }

    // Check if any sell was at a profit
    for (const sell of sells) {
      const avgData = avgCosts[sell.symbol];
      if (avgData && avgData.totalQty > 0) {
        const avgCost = avgData.totalCost / avgData.totalQty;
        if (sell.price_per_share > avgCost) {
          return true;
        }
      }
    }

    return false;
  },

  // Portfolio achievements
  portfolio_11k: async (userId, supabase) => {
    const value = await getPortfolioValue(userId, supabase);
    return value >= 11000;
  },

  portfolio_15k: async (userId, supabase) => {
    const value = await getPortfolioValue(userId, supabase);
    return value >= 15000;
  },

  portfolio_20k: async (userId, supabase) => {
    const value = await getPortfolioValue(userId, supabase);
    return value >= 20000;
  },

  // Learning achievements
  complete_onboarding: async (userId, supabase) => {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();
    return data?.onboarding_completed === true;
  },

  // Social achievements - Watchlist
  first_watchlist: async (userId, supabase) => {
    const { count } = await supabase
      .from("watchlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    return (count || 0) >= 1;
  },

  five_watchlist: async (userId, supabase) => {
    const { count } = await supabase
      .from("watchlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    return (count || 0) >= 5;
  },

  // Social achievements - Groups
  join_group: async (userId, supabase) => {
    const { count } = await supabase
      .from("friend_group_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    return (count || 0) >= 1;
  },

  create_group: async (userId, supabase) => {
    const { count } = await supabase
      .from("friend_groups")
      .select("id", { count: "exact", head: true })
      .eq("created_by", userId);
    return (count || 0) >= 1;
  },
};

// Helper: Get paper account ID for user
async function getPaperAccountId(userId: string, supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from("paper_accounts")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id || "";
}

// Helper: Get current portfolio value (cash + holdings value)
async function getPortfolioValue(userId: string, supabase: SupabaseClient): Promise<number> {
  const accountId = await getPaperAccountId(userId, supabase);
  if (!accountId) return 0;

  // Get cash balance
  const { data: account } = await supabase
    .from("paper_accounts")
    .select("current_cash")
    .eq("id", accountId)
    .single();

  const cash = account?.current_cash || 0;

  // Get holdings - for simplicity, use average_cost * quantity as approximate value
  // (Real-time prices would require API calls)
  const { data: holdings } = await supabase
    .from("holdings")
    .select("quantity, average_cost")
    .eq("paper_account_id", accountId);

  const holdingsValue = (holdings || []).reduce(
    (sum, h) => sum + h.quantity * h.average_cost,
    0
  );

  return cash + holdingsValue;
}

// Check specific achievements by category
export async function checkTradingAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId, ["first_trade", "ten_trades", "fifty_trades", "hundred_trades", "first_profit"]);
}

export async function checkPortfolioAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId, ["portfolio_11k", "portfolio_15k", "portfolio_20k"]);
}

export async function checkWatchlistAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId, ["first_watchlist", "five_watchlist"]);
}

export async function checkGroupAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId, ["join_group", "create_group"]);
}

export async function checkOnboardingAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId, ["complete_onboarding"]);
}

// Main check function
export async function checkAchievements(
  userId: string,
  slugsToCheck?: string[]
): Promise<CheckResult> {
  const supabase = await createClient();

  // Get all active achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true);

  if (!allAchievements) {
    return { newlyUnlocked: [], alreadyUnlocked: [] };
  }

  // Filter to specific slugs if provided
  const achievementsToCheck = slugsToCheck
    ? allAchievements.filter((a) => slugsToCheck.includes(a.slug))
    : allAchievements;

  // Get user's already unlocked achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((userAchievements || []).map((ua) => ua.achievement_id));

  const newlyUnlocked: Achievement[] = [];
  const alreadyUnlocked: string[] = [];

  // Check each achievement
  for (const achievement of achievementsToCheck) {
    if (unlockedIds.has(achievement.id)) {
      alreadyUnlocked.push(achievement.slug);
      continue;
    }

    const checkFn = ACHIEVEMENT_CHECKS[achievement.slug];
    if (!checkFn) continue;

    try {
      const earned = await checkFn(userId, supabase);
      if (earned) {
        // Award the achievement
        const { error } = await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress_value: 1,
          is_seen: false,
        });

        if (!error) {
          newlyUnlocked.push(achievement);
        }
      }
    } catch (err) {
      console.error(`Error checking achievement ${achievement.slug}:`, err);
    }
  }

  return { newlyUnlocked, alreadyUnlocked };
}

// Check all achievements for a user
export async function checkAllAchievements(userId: string): Promise<CheckResult> {
  return checkAchievements(userId);
}
