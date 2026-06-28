import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ScopeHistoryPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const project = await db.project.findFirst({
    where: { id: params.id, userId, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!project) notFound();

  const scopes = await db.projectScope.findMany({
    where: { projectId: params.id },
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
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {project.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scope Version History</h1>
        <p className="text-slate-500 text-sm mt-1">{project.name}</p>
      </div>

      {scopes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 text-sm">
            No scope versions yet. Define a scope from the project page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scopes.map((scope) => (
            <Card key={scope.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    Version {scope.version}
                    {scope.isCurrent && (
                      <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0">
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    {scope.sourceType === "manual" ? (
                      <Type className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>
                      {scope.sourceType === "manual"
                        ? "Manual entry"
                        : scope.fileName ?? "File upload"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {scope.charCount.toLocaleString()} characters ·{" "}
                  {new Date(scope.createdAt).toLocaleString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                    {scope.contentText.length > 1000
                      ? scope.contentText.slice(0, 1000) + "\n\n[… truncated for preview]"
                      : scope.contentText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
