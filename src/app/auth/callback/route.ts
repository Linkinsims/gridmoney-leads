import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user already has a profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (userData?.user_type === "business") {
          return NextResponse.redirect(`${origin}/dashboard/business`);
        } else if (userData?.user_type === "hustler") {
          return NextResponse.redirect(`${origin}/dashboard/hustler`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
