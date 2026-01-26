import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const body = await request.json().catch(() => ({}));
    const achievementIds = body.achievementIds as string[] | undefined;

    if (achievementIds && achievementIds.length > 0) {
      // Mark specific achievements as seen
      const { error } = await supabase
        .from("user_achievements")
        .update({ is_seen: true })
        .eq("user_id", user.id)
        .in("achievement_id", achievementIds);

      if (error) {
        console.error("Error marking achievements as seen:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update achievements" },
          { status: 500 }
        );
      }
    } else {
      // Mark all unseen achievements as seen
      const { error } = await supabase
        .from("user_achievements")
        .update({ is_seen: true })
        .eq("user_id", user.id)
        .eq("is_seen", false);

      if (error) {
        console.error("Error marking all achievements as seen:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update achievements" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Achievements marked as seen",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mark seen error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark achievements as seen" },
      { status: 500 }
    );
  }
}
