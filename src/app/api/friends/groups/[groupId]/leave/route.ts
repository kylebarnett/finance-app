import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST - Leave a group
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
        { success: false, error: "You need to be logged in" },
        { status: 401 }
      );
    }

    // Check membership
    const { data: membership, error: membershipError } = await supabase
      .from("friend_group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: "You're not a member of this group" },
        { status: 400 }
      );
    }

    // Owners can't leave - they must delete or transfer ownership
    if (membership.role === "owner") {
      return NextResponse.json(
        { success: false, error: "As the owner, you can't leave the group. You can delete it or transfer ownership." },
        { status: 400 }
      );
    }

    // Remove from group
    const { error: leaveError } = await supabase
      .from("friend_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (leaveError) {
      console.error("Leave group error:", leaveError);
      return NextResponse.json(
        { success: false, error: "Failed to leave group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You've left the group",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leave group error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
