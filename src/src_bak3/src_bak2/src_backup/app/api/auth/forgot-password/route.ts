import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ForgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { email } = validated.data;

    const user = await db.user.findUnique({
      where: { email },
      select: { name: true },
    });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: `If an account exists for ${email}, you'll receive a reset link shortly.`,
    });

    if (!user) return successResponse;

    const token = await createPasswordResetToken(email);
    if (!token) return successResponse;

    await sendPasswordResetEmail(email, token, user.name ?? undefined).catch(console.error);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
