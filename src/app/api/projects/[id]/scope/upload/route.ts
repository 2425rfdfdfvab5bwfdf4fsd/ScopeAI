import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_LENGTH = 50000;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!["pdf", "docx"].includes(ext ?? "")) {
    return NextResponse.json(
      { error: "Only PDF and DOCX files are supported" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";
  let sourceType: "pdf_upload" | "docx_upload" = "pdf_upload";

  try {
    if (ext === "pdf") {
      sourceType = "pdf_upload";
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      extractedText = result.text;
    } else if (ext === "docx") {
      sourceType = "docx_upload";
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
  } catch {
    return NextResponse.json(
      { error: "Could not read this file. Try a different file or paste your scope manually." },
      { status: 422 }
    );
  }

  // Clean up whitespace
  extractedText = extractedText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (extractedText.length < 10) {
    return NextResponse.json(
      { error: "No readable text found in this file. Try pasting your scope manually." },
      { status: 422 }
    );
  }

  let truncated = false;
  if (extractedText.length > MAX_TEXT_LENGTH) {
    extractedText = extractedText.slice(0, MAX_TEXT_LENGTH);
    truncated = true;
  }

  // Get current version
  const currentScope = await db.projectScope.findFirst({
    where: { projectId: params.id, isCurrent: true },
    select: { version: true },
  });
  const nextVersion = (currentScope?.version ?? 0) + 1;

  const [, newScope] = await db.$transaction([
    db.projectScope.updateMany({
      where: { projectId: params.id, isCurrent: true },
      data: { isCurrent: false },
    }),
    db.projectScope.create({
      data: {
        projectId: params.id,
        version: nextVersion,
        contentText: extractedText,
        sourceType,
        fileName,
        fileSizeBytes: file.size,
        charCount: extractedText.length,
        isCurrent: true,
      },
    }),
  ]);

  await db.project.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    scope: newScope,
    truncated,
    charCount: extractedText.length,
  });
}
