import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AchievementWithStatus } from "@/lib/types/database";

export async function GET() {
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

    // Get all active achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return NextResponse.json(
        { success: false, error: "Failed to load achievements" },
        { status: 500 }
      );
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, progress_value, is_seen")
      .eq("user_id", user.id);

    if (userError) {
      console.error("Error fetching user achievements:", userError);
      return NextResponse.json(
        { success: false, error: "Failed to load user achievements" },
        { status: 500 }
      );
    }

    // Create a map of user achievements
    const userAchievementMap = new Map(
      (userAchievements || []).map((ua) => [ua.achievement_id, ua])
    );

    // Combine achievements with user status
    const achievementsWithStatus: AchievementWithStatus[] = (achievements || []).map(
      (achievement) => {
        const userAchievement = userAchievementMap.get(achievement.id);
        return {
          ...achievement,
          is_unlocked: !!userAchievement,
          unlocked_at: userAchievement?.unlocked_at || null,
          progress_value: userAchievement?.progress_value || 0,
        };
      }
    );

    // Calculate stats
    const totalAchievements = achievementsWithStatus.length;
    const unlockedCount = achievementsWithStatus.filter((a) => a.is_unlocked).length;
    const totalPoints = achievementsWithStatus
      .filter((a) => a.is_unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    const unseenCount = (userAchievements || []).filter((ua) => !ua.is_seen).length;

    // Group by category
    const byCategory = achievementsWithStatus.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, AchievementWithStatus[]>);

    return NextResponse.json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        byCategory,
        stats: {
          total: totalAchievements,
          unlocked: unlockedCount,
          points: totalPoints,
          unseen: unseenCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Achievements error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load achievements" },
      { status: 500 }
    );
  }
}
