import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ScopeAI — AI Scope Guard for Freelance Developers",
    template: "%s | ScopeAI",
  },
  description:
    "Stop doing free work. Every out-of-scope request — caught, documented, and billed. ScopeAI monitors your Slack and email, flags scope creep, and generates professional change orders in seconds.",
  keywords: ["scope creep", "freelance", "change orders", "developer tools", "AI", "billing"],
  authors: [{ name: "ScopeAI" }],
  openGraph: {
    title: "ScopeAI — AI Scope Guard for Freelance Developers",
    description: "Stop doing free work. Every out-of-scope request — caught, documented, and billed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
