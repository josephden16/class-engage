import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { APP_ROUTES } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  const protectedPaths = [
    APP_ROUTES.DASHBOARD,
    APP_ROUTES.PROFILE,
    APP_ROUTES.CREATE_SESSION,
    APP_ROUTES.LECTURER_LIVE_SESSION,
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|login).*)"],
};
