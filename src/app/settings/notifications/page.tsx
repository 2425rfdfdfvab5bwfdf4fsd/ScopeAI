"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface NotifPrefs {
  emailNewAlert: boolean;
  emailDailyDigest: boolean;
  emailDigestHourUtc: number;
  emailCoApproved: boolean;
  emailCoRejected: boolean;
  emailCoExpired: boolean;
  emailIntegrationDisconnect: boolean;
  emailPaymentFailed: boolean;
  inAppNewAlert: boolean;
  inAppCoStatusChange: boolean;
}

type PrefKey = keyof Omit<NotifPrefs, "emailDigestHourUtc">;

const emailPrefs: { key: PrefKey; label: string; description: string }[] = [
  {
    key: "emailNewAlert",
    label: "New alert",
    description: "Receive an email when ScopeAI detects a new out-of-scope request.",
  },
  {
    key: "emailDailyDigest",
    label: "Daily digest",
    description: "A daily summary of unreviewed alerts (sent at 8am UTC).",
  },
  {
    key: "emailCoApproved",
    label: "Change order approved",
    description: "Notify me when a client approves a change order.",
  },
  {
    key: "emailCoRejected",
    label: "Change order rejected",
    description: "Notify me when a client rejects a change order.",
  },
  {
    key: "emailCoExpired",
    label: "Change order expired",
    description: "Notify me when a change order expires without a client decision.",
  },
  {
    key: "emailIntegrationDisconnect",
    label: "Integration disconnected",
    description: "Alert me if a Slack, Gmail, or Outlook integration disconnects unexpectedly.",
  },
  {
    key: "emailPaymentFailed",
    label: "Payment failed",
    description: "Notify me if a subscription payment fails.",
  },
];

const inAppPrefs: { key: PrefKey; label: string; description: string }[] = [
  {
    key: "inAppNewAlert",
    label: "New alert badge",
    description: "Show a badge in the sidebar when there are unreviewed alerts.",
  },
  {
    key: "inAppCoStatusChange",
    label: "Change order status updates",
    description: "Show real-time notifications when clients approve or reject change orders.",
  },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<PrefKey | null>(null);

  useEffect(() => {
    fetch("/api/users/me/notifications")
      .then((r) => r.json())
      .then((data) => setPrefs(data.prefs))
      .catch(() => toast.error("Failed to load notification preferences."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggle(key: PrefKey, value: boolean) {
    if (!prefs) return;
    const prev = prefs[key];
    setPrefs({ ...prefs, [key]: value });
    setSaving(key);
    try {
      const res = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        setPrefs({ ...prefs, [key]: prev });
        toast.error("Failed to save preference.");
      }
    } catch {
      setPrefs({ ...prefs, [key]: prev });
      toast.error("Something went wrong.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 text-sm mt-1">
          Control which emails and in-app alerts you receive.
        </p>
      </div>

      {/* Email notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-600" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Emails are sent to your account email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))
            : emailPrefs.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={key} className="text-sm font-medium text-slate-900 cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={prefs?.[key] ?? true}
                    onCheckedChange={(v) => handleToggle(key, v)}
                    disabled={saving === key}
                  />
                </div>
              ))}
        </CardContent>
      </Card>

      {/* In-app notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-600" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Shown in the app while you&apos;re logged in.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))
            : inAppPrefs.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`inapp-${key}`} className="text-sm font-medium text-slate-900 cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <Switch
                    id={`inapp-${key}`}
                    checked={prefs?.[key] ?? true}
                    onCheckedChange={(v) => handleToggle(key, v)}
                    disabled={saving === key}
                  />
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
