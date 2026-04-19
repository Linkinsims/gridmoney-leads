import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Detect placeholder / unconfigured credentials
function isConfigured() {
  return (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("placeholder") &&
    SUPABASE_ANON_KEY.length > 40 &&
    !SUPABASE_ANON_KEY.includes("placeholder")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If Supabase is not configured yet, only block dashboard/onboarding with a
  // friendly redirect — allow everything else (landing, auth pages, etc.)
  if (!isConfigured()) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect logged-in users away from auth pages
    if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Protect dashboard / onboarding routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
      if (!user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Role-based access control
      if (pathname.startsWith("/dashboard/business") || pathname.startsWith("/dashboard/hustler")) {
        const { data: userData } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (userData) {
          if (pathname.startsWith("/dashboard/business") && userData.user_type !== "business") {
            return NextResponse.redirect(new URL("/dashboard/hustler", request.url));
          }
          if (pathname.startsWith("/dashboard/hustler") && userData.user_type !== "hustler") {
            return NextResponse.redirect(new URL("/dashboard/business", request.url));
          }
        }
      }
    }
  } catch {
    // Supabase error (e.g. network issue) — allow request to continue
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
