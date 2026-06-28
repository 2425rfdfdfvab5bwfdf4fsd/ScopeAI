import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { consumePasswordResetToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...passwordData } = body;

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    const validated = ResetPasswordSchema.safeParse(passwordData);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await consumePasswordResetToken(token);

    if (!result.valid || !result.email) {
      return NextResponse.json(
        { error: "This reset link has expired or is invalid. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(validated.data.password, 12);

    await db.user.updateMany({
      where: { email: result.email },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
