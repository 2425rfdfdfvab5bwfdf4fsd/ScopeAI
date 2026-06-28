import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateScopeSchema } from "@/lib/validations/scope";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id: params.id, userId: session.user.id, deletedAt: null },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

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

  const current = scopes.find((s) => s.isCurrent) ?? null;
  const history = scopes;

  return NextResponse.json({ current, history });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id: params.id, userId: session.user.id, deletedAt: null },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json();
  const validated = UpdateScopeSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { contentText, sourceType, fileName, fileSizeBytes } = validated.data;

  // Get current version number
  const currentScope = await db.projectScope.findFirst({
    where: { projectId: params.id, isCurrent: true },
    select: { version: true },
  });

  const nextVersion = (currentScope?.version ?? 0) + 1;

  // Transaction: mark previous as not current, insert new
  const [, newScope] = await db.$transaction([
    db.projectScope.updateMany({
      where: { projectId: params.id, isCurrent: true },
      data: { isCurrent: false },
    }),
    db.projectScope.create({
      data: {
        projectId: params.id,
        version: nextVersion,
        contentText,
        sourceType: sourceType ?? "manual",
        fileName: fileName ?? null,
        fileSizeBytes: fileSizeBytes ?? null,
        charCount: contentText.length,
        isCurrent: true,
      },
    }),
  ]);

  // Touch project updatedAt
  await db.project.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ scope: newScope });
}
