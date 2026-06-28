import crypto from "crypto";
import { db } from "@/lib/db";

const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(
  email: string,
  userId?: string
): Promise<string> {
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

  // Remove any existing verification tokens for this email
  await db.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: "email_verification",
    },
  });

  await db.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      type: "email_verification",
      expires,
      userId,
    },
  });

  return rawToken;
}

export async function validateVerificationToken(rawToken: string): Promise<{
  valid: boolean;
  email?: string;
  userId?: string;
}> {
  const hashedToken = hashToken(rawToken);

  const token = await db.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!token) return { valid: false };
  if (token.expires < new Date()) {
    await db.verificationToken.delete({ where: { token: hashedToken } });
    return { valid: false };
  }
  if (token.type !== "email_verification") return { valid: false };

  return { valid: true, email: token.identifier, userId: token.userId ?? undefined };
}

export async function consumeVerificationToken(rawToken: string): Promise<{
  valid: boolean;
  email?: string;
  userId?: string;
}> {
  const result = await validateVerificationToken(rawToken);
  if (!result.valid) return result;

  const hashedToken = hashToken(rawToken);
  await db.verificationToken.delete({ where: { token: hashedToken } });

  return result;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) return null;

  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);

  await db.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: "password_reset",
    },
  });

  await db.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      type: "password_reset",
      expires,
      userId: user.id,
    },
  });

  return rawToken;
}

export async function validatePasswordResetToken(rawToken: string): Promise<{
  valid: boolean;
  email?: string;
  userId?: string;
}> {
  const hashedToken = hashToken(rawToken);

  const token = await db.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!token) return { valid: false };
  if (token.expires < new Date()) {
    await db.verificationToken.delete({ where: { token: hashedToken } });
    return { valid: false };
  }
  if (token.type !== "password_reset") return { valid: false };

  return { valid: true, email: token.identifier, userId: token.userId ?? undefined };
}

export async function consumePasswordResetToken(rawToken: string): Promise<{
  valid: boolean;
  email?: string;
  userId?: string;
}> {
  const result = await validatePasswordResetToken(rawToken);
  if (!result.valid) return result;

  const hashedToken = hashToken(rawToken);
  await db.verificationToken.delete({ where: { token: hashedToken } });

  return result;
}
