import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get group info by invite code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient();
    const { code } = await params;

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from("friend_groups")
      .select("id, name, description, emoji, max_members, created_by")
      .eq("invite_code", code)
      .eq("is_active", true)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired invite link" },
        { status: 404 }
      );
    }

    // Get current member count
    const { count } = await supabase
      .from("friend_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);

    // Get creator's name
    let creatorName = "Someone";
    if (group.created_by) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", group.created_by)
        .single();

      if (profile?.full_name) {
        const firstName = profile.full_name.split(" ")[0];
        creatorName = firstName;
      }
    }

    // Check if current user is already a member
    const { data: { user } } = await supabase.auth.getUser();
    let isMember = false;

    if (user) {
      const { data: membership } = await supabase
        .from("friend_group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      isMember = !!membership;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        emoji: group.emoji,
        member_count: count || 0,
        max_members: group.max_members,
        is_full: count ? count >= group.max_members : false,
        is_member: isMember,
        created_by_name: creatorName,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Invite lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// POST - Accept invite and join group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient();
    const { code } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to join a group" },
        { status: 401 }
      );
    }

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from("friend_groups")
      .select("id, name, emoji, max_members")
      .eq("invite_code", code)
      .eq("is_active", true)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired invite link" },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("friend_group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({
        success: true,
        data: {
          group_id: group.id,
          group_name: group.name,
          emoji: group.emoji,
          already_member: true,
        },
        message: "You're already a member of this group!",
        timestamp: new Date().toISOString(),
      });
    }

    // Check member count
    const { count } = await supabase
      .from("friend_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);

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
        group_id: group.id,
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

    return NextResponse.json({
      success: true,
      data: {
        group_id: group.id,
        group_name: group.name,
        emoji: group.emoji,
        already_member: false,
      },
      message: `Welcome to ${group.name}!`,
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
