import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateNotificationPrefsSchema } from "@/lib/validations/scope";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await db.notificationPreferences.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ prefs });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = UpdateNotificationPrefsSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const prefs = await db.notificationPreferences.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...validated.data },
    update: validated.data,
  });

  return NextResponse.json({ prefs });
}
