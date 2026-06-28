import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ShieldCheck, Bell, FileText, FolderOpen, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const userName = session?.user?.name?.split(" ")[0] ?? "there";

  const [activeProjects, projectsWithScopes] = await Promise.all([
    db.project.count({
      where: { userId, status: "active", deletedAt: null },
    }),
    db.project.findMany({
      where: { userId, deletedAt: null, status: "active" },
      include: {
        scopes: { where: { isCurrent: true }, select: { charCount: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  const summaryCards = [
    {
      label: "Open Alerts",
      value: "0",
      icon: <Bell className="w-5 h-5 text-indigo-600" />,
      description: "Unreviewed scope flags",
      bg: "bg-indigo-50",
    },
    {
      label: "Pending Change Orders",
      value: "0",
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      description: "Awaiting client decision",
      bg: "bg-amber-50",
    },
    {
      label: "Active Projects",
      value: String(activeProjects),
      icon: <FolderOpen className="w-5 h-5 text-slate-600" />,
      description: "Currently monitored",
      bg: "bg-slate-100",
    },
    {
      label: "Recovered This Month",
      value: "$0",
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      description: "From approved change orders",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h1>
        <p className="text-slate-500 text-sm mt-1">
          ScopeAI is ready to protect your revenue.
        </p>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
                <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <p className="text-xs text-slate-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects section */}
      {projectsWithScopes.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Create your first project to start monitoring
            </h2>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Add a project, define your scope, and connect Slack or email. ScopeAI will start
              watching for out-of-scope requests immediately.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              New Project
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Your Projects</h2>
            <Link
              href="/projects"
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projectsWithScopes.map((project) => {
              const hasScope = (project.scopes[0]?.charCount ?? 0) > 0;
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                  <Card className="h-full hover:border-indigo-300 hover:shadow-sm transition-all">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{project.clientName}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs text-emerald-600 border-emerald-200 bg-emerald-50"
                        >
                          Active
                        </Badge>
                      </div>
                      {!hasScope && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                          ⚠ No scope defined
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
