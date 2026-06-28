import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (existingUser) {
      // Don't reveal if email exists — send verification email again if unverified
      if (!existingUser.emailVerified) {
        const token = await createVerificationToken(email, existingUser.id);
        await sendVerificationEmail(email, token, name).catch(console.error);
      }
      // Return same response regardless — prevents email enumeration
      return NextResponse.json(
        { message: "If this email is not registered, you will receive a verification email." },
        { status: 200 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: false,
      },
      select: { id: true, email: true },
    });

    // Create and send verification email
    const token = await createVerificationToken(email, user.id);

    try {
      await sendVerificationEmail(email, token, name);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the registration — user can request resend
    }

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
