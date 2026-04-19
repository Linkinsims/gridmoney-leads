import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Use fallbacks during build time to prevent Vercel build errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
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
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Redirect logged-in users away from auth pages
    if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
      if (!user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Check user role for role-specific routes
      if (user && (pathname.startsWith("/dashboard/business") || pathname.startsWith("/dashboard/hustler"))) {
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
  } catch (error) {
    // If Supabase variables are missing, let the user pass but they will see errors on dashboard
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
