import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/verify", "/auth/forgot-password", "/auth/reset-password", "/auth/error", "/privacy", "/terms"];
const publicPrefixes = ["/api/auth", "/api/webhooks", "/co/", "/api/co/", "/api/healthcheck"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes and prefixes
  if (
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to sign in
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
