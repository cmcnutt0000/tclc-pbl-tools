import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

const ALLOWED_DOMAINS = [
  "humanrestorationproject.org",
  "orchardview.org",
  "reeths-puffer.org",
  "muskegonisd.org",
];

export async function middleware(request: NextRequest) {
  // Let Auth0 SDK handle /auth/* routes (login, callback, logout, etc.)
  const authResponse = await auth0.middleware(request);

  // For /auth/* paths, just return the SDK response
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return authResponse;
  }

  // Allow static assets and the unauthorized page through
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico" ||
    pathname === "/unauthorized"
  ) {
    return authResponse;
  }

  // Check session for all other routes
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Validate email domain server-side (defense in depth)
  const email = session.user.email || "";
  const domain = email.split("@")[1] || "";
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
