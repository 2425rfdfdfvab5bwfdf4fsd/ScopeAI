import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
      onboardingStep: number;
      emailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    onboardingCompleted?: boolean;
    onboardingStep?: number;
    emailVerified?: boolean;
  }
}
