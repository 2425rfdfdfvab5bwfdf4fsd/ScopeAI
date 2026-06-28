import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const ResendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ResendSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { email } = validated.data;

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ message: "Verification email sent if account exists." });
    }

    const token = await createVerificationToken(email, user.id);
    await sendVerificationEmail(email, token, user.name ?? undefined);

    return NextResponse.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
