import NextAuth from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authConfig } from "./server/auth/config";

/** Manually create separate auth instance for Edge Runtime
 * since Prisma Adapter is not supported
 */
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  // If no session, redirect to sign in
  if (!req.auth) {
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
