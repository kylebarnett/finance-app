import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get user's leaderboard settings
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in" },
        { status: 401 }
      );
    }

    // Get existing settings or return defaults
    const { data: settings, error: settingsError } = await supabase
      .from("leaderboard_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Settings fetch error:", settingsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // Return settings or defaults
    return NextResponse.json({
      success: true,
      data: settings || {
        user_id: user.id,
        show_on_public_leaderboard: false,
        display_name_override: null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard settings error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// PUT - Update user's leaderboard settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { show_on_public_leaderboard, display_name_override } = body;

    // Validate display name if provided
    if (display_name_override !== undefined && display_name_override !== null) {
      if (typeof display_name_override !== "string" || display_name_override.length > 30) {
        return NextResponse.json(
          { success: false, error: "Display name must be 30 characters or less" },
          { status: 400 }
        );
      }
    }

    // Check if settings already exist
    const { data: existing } = await supabase
      .from("leaderboard_settings")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("leaderboard_settings")
        .update({
          show_on_public_leaderboard: show_on_public_leaderboard ?? false,
          display_name_override: display_name_override || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Settings update error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update settings" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("leaderboard_settings")
        .insert({
          user_id: user.id,
          show_on_public_leaderboard: show_on_public_leaderboard ?? false,
          display_name_override: display_name_override || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Settings insert error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save settings" },
          { status: 500 }
        );
      }
      result = data;
    }

    const message = show_on_public_leaderboard
      ? "You're now visible on the public leaderboard!"
      : "You've been removed from the public leaderboard.";

    return NextResponse.json({
      success: true,
      data: result,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard settings error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
