import { auth } from "@/lib/auth";
import Link from "next/link";
import { Bell, Plug, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsSections = [
  {
    href: "/settings/notifications",
    icon: Bell,
    label: "Notifications",
    description: "Control which emails and in-app alerts you receive from ScopeAI.",
  },
  {
    href: "/settings/integrations",
    icon: Plug,
    label: "Integrations",
    description: "Connect Slack, Gmail, and Outlook to monitor client communications.",
  },
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile",
    description: "Update your name and account preferences.",
  },
];

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account, notifications, and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsSections.map(({ href, icon: Icon, label, description }) => (
          <Link key={href} href={href} className="group block">
            <Card className="h-full hover:border-indigo-300 hover:shadow-sm transition-all">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {label}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Account info */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-slate-700 mb-1">Signed in as</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
