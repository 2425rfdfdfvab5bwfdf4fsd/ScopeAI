import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateProjectSchema } from "@/lib/validations/project";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      scopes: {
        where: { isCurrent: true },
        select: { id: true, charCount: true, sourceType: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = CreateProjectSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, clientName, clientEmail, notes } = validated.data;

  const project = await db.project.create({
    data: {
      userId: session.user.id,
      name,
      clientName,
      clientEmail,
      notes,
    },
  });

  // Upsert client record for reuse
  await db.client.upsert({
    where: { userId_email: { userId: session.user.id, email: clientEmail } },
    update: { name: clientName },
    create: { userId: session.user.id, name: clientName, email: clientEmail },
  });

  return NextResponse.json({ project }, { status: 201 });
}
