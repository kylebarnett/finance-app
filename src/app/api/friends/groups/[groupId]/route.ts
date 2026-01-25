import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get group details
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

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from("friend_groups")
      .select("*")
      .eq("id", groupId)
      .eq("is_active", true)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Get members with their profiles
    const { data: members, error: membersError } = await supabase
      .from("friend_group_members")
      .select("user_id, role, joined_at")
      .eq("group_id", groupId);

    if (membersError) {
      console.error("Members fetch error:", membersError);
    }

    // Get profiles for members
    const memberIds = (members || []).map(m => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", memberIds);

    const profileMap: Record<string, string> = {};
    (profiles || []).forEach(p => {
      profileMap[p.id] = p.full_name || "Investor";
    });

    const enrichedMembers = (members || []).map(m => ({
      ...m,
      display_name: profileMap[m.user_id] || "Investor",
      is_current_user: m.user_id === user.id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...group,
        role: membership.role,
        members: enrichedMembers,
        member_count: enrichedMembers.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a group (owner only)
export async function DELETE(
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

    // Check if user is the owner
    const { data: membership } = await supabase
      .from("friend_group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Only the group owner can delete the group" },
        { status: 403 }
      );
    }

    // Soft delete - mark as inactive
    const { error: deleteError } = await supabase
      .from("friend_groups")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", groupId);

    if (deleteError) {
      console.error("Group delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Group has been deleted",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Group delete error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
