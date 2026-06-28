import { Plug, MessageSquare, Mail, MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description:
      "Monitor client messages in selected Slack channels. Requires a Slack workspace.",
    icon: MessageSquare,
    iconBg: "bg-[#4A154B]",
    phase: "Phase 2",
  },
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Monitor incoming emails from client email addresses via Gmail push notifications.",
    icon: Mail,
    iconBg: "bg-[#EA4335]",
    phase: "Phase 2",
  },
  {
    id: "outlook",
    name: "Outlook",
    description:
      "Monitor incoming emails from client addresses via Microsoft Graph webhooks.",
    icon: MailCheck,
    iconBg: "bg-[#0072C6]",
    phase: "Phase 2",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Connect your communication channels so ScopeAI can monitor client messages.
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map(({ id, name, description, icon: Icon, iconBg, phase }) => (
          <Card key={id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{name}</h3>
                    <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs">
                      Coming in {phase}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-sm text-slate-400">Not connected</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 w-full" disabled>
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-indigo-100 bg-indigo-50/50">
        <CardContent className="p-5 flex items-start gap-3">
          <Plug className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              Integrations are coming in Phase 2
            </p>
            <p className="text-sm text-indigo-700 mt-0.5">
              Slack, Gmail, and Outlook connections are being built. Once connected, ScopeAI will
              automatically monitor client messages and flag scope creep in real time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
