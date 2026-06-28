import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeVerificationToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/verify?error=missing_token", request.url));
  }

  try {
    const result = await consumeVerificationToken(token);

    if (!result.valid || !result.email) {
      return NextResponse.redirect(new URL("/auth/verify?error=invalid_token", request.url));
    }

    // Mark user as verified
    await db.user.updateMany({
      where: { email: result.email },
      data: { emailVerified: true },
    });

    return NextResponse.redirect(new URL("/auth/signin?verified=true", request.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/verify?error=server_error", request.url));
  }
}
