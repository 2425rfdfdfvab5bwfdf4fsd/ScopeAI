import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ScopeAI <noreply@scopeai.co>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verificationUrl = `${APP_URL}/auth/verify?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your ScopeAI account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your ScopeAI account</title>
        </head>
        <body style="font-family: Inter, system-ui, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden;">
            <!-- Header -->
            <div style="background-color: #0F172A; padding: 24px 32px;">
              <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0;">ScopeAI</h1>
              <p style="color: #64748B; font-size: 13px; margin: 4px 0 0;">AI Scope Guard for Freelance Developers</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <h2 style="color: #0F172A; font-size: 24px; font-weight: 700; margin: 0 0 8px;">Verify your email</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi${name ? ` ${name}` : ""},<br><br>
                Welcome to ScopeAI. Click the button below to verify your email address and activate your account.
              </p>

              <a href="${verificationUrl}"
                style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                Verify Email Address
              </a>

              <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
                This link expires in 24 hours. If you didn't create a ScopeAI account, you can safely ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;">

              <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                Or copy and paste this URL into your browser:<br>
                <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your ScopeAI password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your ScopeAI password</title>
        </head>
        <body style="font-family: Inter, system-ui, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden;">
            <div style="background-color: #0F172A; padding: 24px 32px;">
              <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0;">ScopeAI</h1>
              <p style="color: #64748B; font-size: 13px; margin: 4px 0 0;">AI Scope Guard for Freelance Developers</p>
            </div>

            <div style="padding: 32px;">
              <h2 style="color: #0F172A; font-size: 24px; font-weight: 700; margin: 0 0 8px;">Reset your password</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi${name ? ` ${name}` : ""},<br><br>
                We received a request to reset your ScopeAI password. Click the button below to choose a new password.
              </p>

              <a href="${resetUrl}"
                style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                Reset Password
              </a>

              <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
