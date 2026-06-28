import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal auth header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">ScopeAI</span>
        </Link>
      </header>

      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} ScopeAI · AI Scope Guard for Freelance Developers
        </p>
      </footer>
    </div>
  );
}
