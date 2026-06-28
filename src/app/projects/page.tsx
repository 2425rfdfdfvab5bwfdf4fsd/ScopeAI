import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderOpen, AlertCircle, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const activeProjects = await db.project.findMany({
    where: { userId, status: "active", deletedAt: null },
    include: {
      scopes: { where: { isCurrent: true }, select: { charCount: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const archivedProjects = await db.project.findMany({
    where: { userId, status: "archived", deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your client projects and monitor for scope creep.
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Active Projects */}
      {activeProjects.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No active projects</h2>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Create your first project to start monitoring client communications for scope creep.
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeProjects.map((project) => {
            const hasScope = (project.scopes[0]?.charCount ?? 0) > 0;
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                <Card className="h-full hover:border-indigo-300 hover:shadow-sm transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate mt-0.5">{project.clientName}</p>
                        <p className="text-xs text-slate-400 truncate">{project.clientEmail}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs text-emerald-600 border-emerald-200 bg-emerald-50"
                      >
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        0 alerts
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        0 change orders
                      </span>
                    </div>

                    {!hasScope && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        No scope defined — add one to enable monitoring
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Archived ({archivedProjects.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {archivedProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                <Card className="h-full opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-700 truncate">{project.name}</h3>
                        <p className="text-sm text-slate-400 truncate mt-0.5">{project.clientName}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs text-slate-500">
                        Archived
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
