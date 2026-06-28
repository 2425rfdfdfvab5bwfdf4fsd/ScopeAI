import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Zap, FileText, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">ScopeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <Badge className="mb-6 text-sm px-4 py-1.5">
          14-day free trial · No credit card required
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
          Stop doing{" "}
          <span className="text-indigo-600">free work.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Every out-of-scope request — caught, documented, and billed.
          ScopeAI monitors your Slack and email, flags scope creep in real time,
          and generates professional change orders in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem Stats */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { stat: "57%", label: "of agencies lose $1K–$5K/month to scope creep" },
              { stat: "$7,800+", label: "lost per year by the average solo developer" },
              { stat: "99%", label: "of freelancers fail to bill all out-of-scope work" },
            ].map((item) => (
              <div key={item.stat}>
                <div className="text-4xl font-bold text-indigo-400 mb-2">{item.stat}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How ScopeAI works</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Set it up in 10 minutes. Never miss a scope creep request again.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-indigo-600" />,
              step: "01",
              title: "Connect your channels",
              description:
                "Link your Slack workspace and Gmail or Outlook account. ScopeAI monitors client messages automatically — no manual checking required.",
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
              step: "02",
              title: "AI flags scope creep",
              description:
                "Every message is analyzed against your agreed project scope. Out-of-scope requests are flagged instantly with AI reasoning and a confidence score.",
            },
            {
              icon: <FileText className="w-6 h-6 text-indigo-600" />,
              step: "03",
              title: "Send a change order in 2 minutes",
              description:
                "Confirm the alert, review the AI-drafted change order, and send it to your client — who can approve with one click, no account needed.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to protect your revenue
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Slack, Gmail, and Outlook monitoring",
              "AI scope comparison with explanations",
              "Professional change order generation",
              "Client approval (no account required)",
              "Complete audit trail for disputes",
              "Multi-project management",
              "AI sensitivity controls",
              "Scope version history",
              "Real-time alert notifications",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-slate-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Ready to stop leaving money on the table?
        </h2>
        <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
          Join freelance developers who use ScopeAI to recover thousands of dollars in unbilled work every month.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="px-10">
            Start Your Free Trial
          </Button>
        </Link>
        <p className="text-slate-400 text-sm mt-4">14 days free · No credit card required · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-900">ScopeAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} ScopeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
