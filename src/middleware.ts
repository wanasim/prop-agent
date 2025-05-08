import NextAuth from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authConfig } from "./server/auth/config";

/** Manually create separate auth instance for Edge Runtime
 * since Prisma Adapter is not supported
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Skip middleware for onboarding page
  if (req.nextUrl.pathname === "/onboarding") {
    return NextResponse.next();
  }

  const userType = req.auth?.user.userType;

  // If no session, redirect to sign in
  if (!req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  // If user has no userType, redirect to onboarding
  if (!userType) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  /** TODO: ADD THIS BACK IN??? */
  // // If user is on onboarding page but has userType, redirect to home
  if (req.nextUrl.pathname === "/onboarding" && userType) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
