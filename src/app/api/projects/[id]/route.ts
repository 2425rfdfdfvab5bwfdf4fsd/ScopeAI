import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateProjectSchema } from "@/lib/validations/project";

async function getProjectOrFail(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });
  return project;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id: params.id, userId: session.user.id, deletedAt: null },
    include: {
      scopes: {
        where: { isCurrent: true },
        select: {
          id: true,
          version: true,
          contentText: true,
          sourceType: true,
          fileName: true,
          fileSizeBytes: true,
          charCount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectOrFail(params.id, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json();
  const validated = UpdateProjectSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await db.project.update({
    where: { id: params.id },
    data: validated.data,
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectOrFail(params.id, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Soft delete
  await db.project.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "archived" },
  });

  return NextResponse.json({ success: true });
}
