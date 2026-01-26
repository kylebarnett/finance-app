import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get user's onboarding status
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed, onboarding_completed_at, onboarding_step")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch onboarding status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        onboarding_completed: profile?.onboarding_completed ?? false,
        onboarding_completed_at: profile?.onboarding_completed_at ?? null,
        onboarding_step: profile?.onboarding_step ?? 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// PATCH - Update onboarding progress
export async function PATCH(request: NextRequest) {
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
    const { step, completed } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Update step if provided
    if (typeof step === "number" && step >= 0 && step <= 5) {
      updateData.onboarding_step = step;
    }

    // Mark as completed if specified
    if (completed === true) {
      updateData.onboarding_completed = true;
      updateData.onboarding_completed_at = new Date().toISOString();
      updateData.onboarding_step = 5; // Final step
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select("onboarding_completed, onboarding_completed_at, onboarding_step")
      .single();

    if (updateError) {
      console.error("Onboarding update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update onboarding progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: completed ? "Onboarding complete! Welcome to Flynn!" : "Progress saved",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Onboarding update error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
