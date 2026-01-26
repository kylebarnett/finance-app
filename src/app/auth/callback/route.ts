import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .single();

      // Redirect new users (who haven't completed onboarding) to the tutorial
      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
