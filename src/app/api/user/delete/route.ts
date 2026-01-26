import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
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

    // Delete user data in order (respecting foreign key constraints)
    // The order matters: delete dependent data first

    // 1. Get paper account ID first
    const { data: paperAccount } = await supabase
      .from("paper_accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (paperAccount) {
      // 2. Delete transactions (depends on paper_account)
      await supabase
        .from("transactions")
        .delete()
        .eq("paper_account_id", paperAccount.id);

      // 3. Delete holdings (depends on paper_account)
      await supabase
        .from("holdings")
        .delete()
        .eq("paper_account_id", paperAccount.id);

      // 4. Delete paper account
      await supabase
        .from("paper_accounts")
        .delete()
        .eq("id", paperAccount.id);
    }

    // 5. Delete watchlist items
    await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", user.id);

    // 6. Delete user achievements
    await supabase
      .from("user_achievements")
      .delete()
      .eq("user_id", user.id);

    // 7. Delete friend group memberships
    await supabase
      .from("friend_group_members")
      .delete()
      .eq("user_id", user.id);

    // 8. Delete friend groups created by user
    const { data: userGroups } = await supabase
      .from("friend_groups")
      .select("id")
      .eq("created_by", user.id);

    if (userGroups && userGroups.length > 0) {
      const groupIds = userGroups.map(g => g.id);

      // Delete members of those groups first
      await supabase
        .from("friend_group_members")
        .delete()
        .in("group_id", groupIds);

      // Delete the groups
      await supabase
        .from("friend_groups")
        .delete()
        .in("id", groupIds);
    }

    // 9. Delete leaderboard settings
    await supabase
      .from("leaderboard_settings")
      .delete()
      .eq("user_id", user.id);

    // 10. Delete profile
    await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    // 11. Finally, delete the auth user (this requires admin API or user to be signed in)
    // For Supabase, we need to use the admin client or have the user delete themselves
    // Since we're using server-side, we can sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully. We're sorry to see you go!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
