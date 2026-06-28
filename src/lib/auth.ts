import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      async authorize(credentials) {
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
            passwordHash: true,
            onboardingCompleted: true,
            onboardingStep: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) return null;

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Fetch fresh user data including onboarding status
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            onboardingCompleted: true,
            onboardingStep: true,
            emailVerified: true,
          },
        });

        if (dbUser) {
          session.user.onboardingCompleted = dbUser.onboardingCompleted;
          session.user.onboardingStep = dbUser.onboardingStep;
          session.user.emailVerified = dbUser.emailVerified;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      // Allow OAuth sign-ins immediately (email is verified by provider)
      if (account?.provider !== "credentials") {
        // Mark email as verified for OAuth users
        if (user.email) {
          await db.user.updateMany({
            where: { email: user.email },
            data: { emailVerified: true },
          });
        }
        return true;
      }

      // For credentials: email must be verified
      const dbUser = await db.user.findUnique({
        where: { email: user.email! },
        select: { emailVerified: true },
      });

      return dbUser?.emailVerified ?? false;
    },
  },
  events: {
    async createUser({ user }) {
      // Create default notification preferences for new users
      if (user.email) {
        // This will be expanded in Phase 1 when notification_preferences table exists
        console.warn(`New user created: ${user.email}`);
      }
    },
  },
});
