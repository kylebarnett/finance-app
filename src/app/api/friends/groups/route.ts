import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

// GET - List user's friend groups
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

    // Get groups the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from("friend_group_members")
      .select("group_id, role, joined_at")
      .eq("user_id", user.id);

    if (membershipError) {
      console.error("Membership fetch error:", membershipError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch your groups" },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Get group details
    const groupIds = memberships.map(m => m.group_id);
    const { data: groups, error: groupsError } = await supabase
      .from("friend_groups")
      .select("*")
      .in("id", groupIds)
      .eq("is_active", true);

    if (groupsError) {
      console.error("Groups fetch error:", groupsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch group details" },
        { status: 500 }
      );
    }

    // Get member counts for each group
    const { data: memberCounts } = await supabase
      .from("friend_group_members")
      .select("group_id")
      .in("group_id", groupIds);

    const memberCountMap: Record<string, number> = {};
    (memberCounts || []).forEach(m => {
      memberCountMap[m.group_id] = (memberCountMap[m.group_id] || 0) + 1;
    });

    // Combine data
    const enrichedGroups = (groups || []).map(group => {
      const membership = memberships.find(m => m.group_id === group.id);
      return {
        ...group,
        role: membership?.role || "member",
        joined_at: membership?.joined_at,
        member_count: memberCountMap[group.id] || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedGroups,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Groups fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// POST - Create a new friend group
export async function POST(request: NextRequest) {
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
    const { name, description, emoji } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a group name (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: "Group name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Generate unique invite code
    const inviteCode = nanoid(8);

    // Create the group
    const { data: newGroup, error: createError } = await supabase
      .from("friend_groups")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        emoji: emoji || "🏆",
        created_by: user.id,
        invite_code: inviteCode,
        is_active: true,
        max_members: 20,
      })
      .select()
      .single();

    if (createError) {
      console.error("Group create error:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create group" },
        { status: 500 }
      );
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from("friend_group_members")
      .insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      console.error("Member add error:", memberError);
      // Rollback group creation
      await supabase.from("friend_groups").delete().eq("id", newGroup.id);
      return NextResponse.json(
        { success: false, error: "Failed to create group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newGroup,
        role: "owner",
        member_count: 1,
      },
      message: `Your group "${newGroup.name}" has been created!`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Group create error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
