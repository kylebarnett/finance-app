import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE - Remove stock from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const supabase = await createClient();
    const { symbol } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in" },
        { status: 401 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // Delete from watchlist
    const { error: deleteError } = await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("symbol", upperSymbol);

    if (deleteError) {
      console.error("Watchlist delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to remove from watchlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${upperSymbol} removed from your watchlist`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Watchlist delete error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
