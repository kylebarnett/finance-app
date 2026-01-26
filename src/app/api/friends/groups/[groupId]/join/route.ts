import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkGroupAchievements } from "@/lib/achievements/checker";

// POST - Join a group via invite code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient();
    const { groupId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to join a group" },
        { status: 401 }
      );
    }

    // Get the group
    const { data: group, error: groupError } = await supabase
      .from("friend_groups")
      .select("*")
      .eq("id", groupId)
      .eq("is_active", true)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Group not found or no longer active" },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("friend_group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "You're already a member of this group!" },
        { status: 400 }
      );
    }

    // Check member count
    const { count } = await supabase
      .from("friend_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (count && count >= group.max_members) {
      return NextResponse.json(
        { success: false, error: "This group is full!" },
        { status: 400 }
      );
    }

    // Add user as member
    const { error: joinError } = await supabase
      .from("friend_group_members")
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: "member",
      });

    if (joinError) {
      console.error("Join group error:", joinError);
      return NextResponse.json(
        { success: false, error: "Failed to join group" },
        { status: 500 }
      );
    }

    // Check for group achievements
    const achievementResult = await checkGroupAchievements(user.id);

    return NextResponse.json({
      success: true,
      data: {
        group_id: groupId,
        group_name: group.name,
        emoji: group.emoji,
      },
      message: `Welcome to ${group.name}!`,
      achievements: achievementResult.newlyUnlocked.length > 0 ? achievementResult.newlyUnlocked : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Join group error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
