import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkTradingAchievements,
  checkPortfolioAchievements,
  checkWatchlistAchievements,
  checkGroupAchievements,
  checkOnboardingAchievements,
  checkAllAchievements,
} from "@/lib/achievements/checker";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get category to check (optional)
    const body = await request.json().catch(() => ({}));
    const category = body.category as string | undefined;

    let result;

    switch (category) {
      case "trading":
        result = await checkTradingAchievements(user.id);
        break;
      case "portfolio":
        result = await checkPortfolioAchievements(user.id);
        break;
      case "watchlist":
        result = await checkWatchlistAchievements(user.id);
        break;
      case "groups":
        result = await checkGroupAchievements(user.id);
        break;
      case "onboarding":
        result = await checkOnboardingAchievements(user.id);
        break;
      default:
        result = await checkAllAchievements(user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        newlyUnlocked: result.newlyUnlocked,
        newlyUnlockedCount: result.newlyUnlocked.length,
        category: category || "all",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
