import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require research_access
const RESEARCH_ROUTES = [
  "/dashboard",
  "/clinics",
  "/patients",
  "/biomarkers",
  "/experiments",
  "/datasets",
  "/papers",
  "/trials",
];

// Admin-only routes
const ADMIN_ROUTES = ["/admin"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-pathname": request.nextUrl.pathname,
      }),
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: new Headers({
                ...Object.fromEntries(request.headers),
                "x-pathname": request.nextUrl.pathname,
              }),
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: new Headers({
                ...Object.fromEntries(request.headers),
                "x-pathname": request.nextUrl.pathname,
              }),
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  const publicPaths = ["/", "/login", "/signup", "/auth/callback"];
  const isPublicPath = publicPaths.some((p) => request.nextUrl.pathname === p);

  if (!user && !isPublicPath && !request.nextUrl.pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // For authenticated users, enforce research access on protected routes
  if (user) {
    const pathname = request.nextUrl.pathname;

    const isResearchRoute = RESEARCH_ROUTES.some((r) => pathname.startsWith(r));
    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

    if (isResearchRoute || isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("research_access, role")
        .eq("id", user.id)
        .single();

      const hasResearchAccess = profile?.research_access === true;
      const isAdmin = profile?.role === "admin";

      if (isAdminRoute && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/hub";
        return NextResponse.redirect(url);
      }

      if (isResearchRoute && !hasResearchAccess && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/hub";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
