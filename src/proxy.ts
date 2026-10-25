import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 * This is only a FAST FIRST CHECK: "is there a session cookie at all?". It does not
 * prove the session is valid — every admin page re-verifies via requireAdmin().
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isOpenAdminRoute = pathname === "/admin/login" || pathname.startsWith("/admin/forgot-password");
  if (!isOpenAdminRoute && !request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
