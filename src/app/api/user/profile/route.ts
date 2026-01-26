import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProfileStats {
  tradeCount: number;
  achievementCount: number;
  watchlistCount: number;
  groupCount: number;
  memberSince: string;
  daysSinceJoined: number;
}

// GET - Get user profile with stats
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get paper account for trade count
    const { data: paperAccount } = await supabase
      .from("paper_accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let tradeCount = 0;
    if (paperAccount) {
      const { count } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("paper_account_id", paperAccount.id);
      tradeCount = count || 0;
    }

    // Get achievement count
    const { count: achievementCount } = await supabase
      .from("user_achievements")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get watchlist count
    const { count: watchlistCount } = await supabase
      .from("watchlist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get group count
    const { count: groupCount } = await supabase
      .from("friend_group_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get leaderboard settings
    const { data: leaderboardSettings } = await supabase
      .from("leaderboard_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Calculate days since joined
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const daysSinceJoined = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const stats: ProfileStats = {
      tradeCount,
      achievementCount: achievementCount || 0,
      watchlistCount: watchlistCount || 0,
      groupCount: groupCount || 0,
      memberSince: profile.created_at,
      daysSinceJoined,
    };

    return NextResponse.json({
      success: true,
      data: {
        profile,
        stats,
        leaderboardSettings: leaderboardSettings || {
          show_on_public_leaderboard: true,
          display_name_override: null,
        },
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { display_name, avatar_emoji } = body;

    // Validate inputs
    const updates: Record<string, string | null> = {};

    if (display_name !== undefined) {
      if (typeof display_name !== "string") {
        return NextResponse.json(
          { success: false, error: "Display name must be a string" },
          { status: 400 }
        );
      }
      if (display_name.length > 30) {
        return NextResponse.json(
          { success: false, error: "Display name must be 30 characters or less" },
          { status: 400 }
        );
      }
      updates.display_name = display_name.trim() || null;
    }

    if (avatar_emoji !== undefined) {
      if (typeof avatar_emoji !== "string") {
        return NextResponse.json(
          { success: false, error: "Avatar must be a string" },
          { status: 400 }
        );
      }
      updates.avatar_emoji = avatar_emoji;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
