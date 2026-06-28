import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, User, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { ArchiveProjectDialog } from "@/components/projects/archive-project-dialog";
import { ScopeEditor } from "@/components/projects/scope-editor";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const project = await db.project.findFirst({
    where: { id: params.id, userId, deletedAt: null },
    include: {
      scopes: {
        orderBy: { version: "desc" },
        select: {
          id: true,
          version: true,
          contentText: true,
          sourceType: true,
          fileName: true,
          fileSizeBytes: true,
          charCount: true,
          isCurrent: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) notFound();

  const currentScope = project.scopes.find((s) => s.isCurrent) ?? null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge
              variant="outline"
              className={
                project.status === "active"
                  ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                  : "text-slate-500 border-slate-200"
              }
            >
              {project.status === "active" ? "Active" : "Archived"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {project.clientName}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {project.clientEmail}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EditProjectDialog project={project} />
          <ArchiveProjectDialog project={project} />
        </div>
      </div>

      {/* No scope warning */}
      {!currentScope && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <p>
            No scope defined — ScopeAI can&apos;t detect out-of-scope requests yet.{" "}
            <strong>Open the Scope tab below to add your project scope.</strong>
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={currentScope ? "alerts" : "scope"}>
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="change-orders">Change Orders</TabsTrigger>
          <TabsTrigger value="scope">Scope</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <EmptyTabState
            icon={<AlertCircle className="w-8 h-8 text-slate-300" />}
            title="No alerts yet"
            description="Alerts will appear here once ScopeAI detects out-of-scope requests from your connected integrations."
            hint="Connect Slack or email in Settings → Integrations to start monitoring."
          />
        </TabsContent>

        {/* Change Orders Tab */}
        <TabsContent value="change-orders">
          <EmptyTabState
            icon={
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No change orders"
            description="Change orders will appear here once you confirm an alert as out-of-scope and generate a change order."
          />
        </TabsContent>

        {/* Scope Tab */}
        <TabsContent value="scope">
          <div className="space-y-6">
            {currentScope && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">
                    Version {currentScope.version}
                  </span>
                  {" · "}
                  {currentScope.charCount.toLocaleString()} characters
                  {currentScope.fileName && (
                    <>{" · "}<span className="italic">{currentScope.fileName}</span></>
                  )}
                  {" · "}
                  Updated {new Date(currentScope.createdAt).toLocaleDateString()}
                </div>
                <Link
                  href={`/projects/${project.id}/scope/history`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View history ({project.scopes.length})
                </Link>
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <ScopeEditor
                  projectId={project.id}
                  initialText={currentScope?.contentText ?? ""}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources">
          <EmptyTabState
            icon={
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
            title="No monitored sources"
            description="Connect Slack or email integrations, then add sources here to tell ScopeAI which channels and email addresses to monitor for this project."
            hint={
              <Link href="/settings/integrations" className="text-indigo-600 hover:underline text-sm">
                Go to Integrations →
              </Link>
            }
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="space-y-3">
            {project.scopes.length > 0 ? (
              <>
                <p className="text-sm text-slate-500">
                  Project activity and scope change history.
                </p>
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-1">
                    <AuditEntry
                      label="Project created"
                      actor="You"
                      date={project.createdAt}
                    />
                    {[...project.scopes].reverse().map((scope) => (
                      <AuditEntry
                        key={scope.id}
                        label={`Scope v${scope.version} saved (${scope.sourceType === "manual" ? "manual entry" : scope.fileName ?? "file upload"})`}
                        actor="You"
                        date={scope.createdAt}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <AuditEntry label="Project created" actor="You" date={project.createdAt} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyTabState({
  icon,
  title,
  description,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  hint?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="py-14 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 max-w-sm">{description}</p>
        {hint && <div className="mt-4">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function AuditEntry({
  label,
  actor,
  date,
}: {
  label: string;
  actor: string;
  date: Date | string;
}) {
  return (
    <div className="flex items-start gap-4 pl-8 relative pb-4">
      <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {actor} · {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
