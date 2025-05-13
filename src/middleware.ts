import NextAuth from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authConfig } from "./server/auth/config";

/** Manually create separate auth instance for Edge Runtime
 * since Prisma Adapter is not supported
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  /** Non-authenticated users or users with a userType are redirected to the home page */
  if ((!req.auth || !!req.auth?.user?.userType) && req.url.includes("/onboarding")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/trpc (tRPC endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico).*)",
  ],
};
