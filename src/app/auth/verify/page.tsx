"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";

const errorMessages: Record<string, string> = {
  missing_token: "No verification token was found. Please check your email link.",
  invalid_token: "This verification link has expired or is invalid. Request a new one.",
  server_error: "Something went wrong. Please try again.",
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const email = searchParams.get("email") ?? "";

  if (error) {
    return (
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <CardTitle>Verification failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{errorMessages[error] ?? "Verification failed."}</AlertDescription>
          </Alert>
          <div className="text-center space-y-3">
            <Link href="/auth/signup">
              <Button className="w-full">Request a new verification email</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          {email
            ? `We sent a verification link to ${email}`
            : "Click the verification link in your email to activate your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-slate-500">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/auth/signin">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
