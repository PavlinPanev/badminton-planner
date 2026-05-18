import { NextRequest, NextResponse } from "next/server";

import { sessionCookieName, verifySessionToken } from "@/auth/token";

const publicRoutes = new Set(["/", "/venues", "/events", "/login", "/register"]);

function isPublicPath(pathname: string) {
  if (publicRoutes.has(pathname)) {
    return true;
  }

  return pathname.startsWith("/_next/") || pathname === "/favicon.ico";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(sessionCookieName)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token).catch(() => null);

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(sessionCookieName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
