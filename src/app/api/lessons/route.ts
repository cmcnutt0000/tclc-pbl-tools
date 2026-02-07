import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const boardId = request.nextUrl.searchParams.get("boardId");
  if (!boardId) {
    return NextResponse.json(
      { error: "boardId is required" },
      { status: 400 },
    );
  }

  const lessons = await prisma.lessonPlan.findMany({
    where: { boardId },
    orderBy: [{ agendaEntryId: "asc" }, { subject: "asc" }],
  });

  const parsed = lessons.map((lesson) => ({
    ...lesson,
    content: JSON.parse(lesson.content),
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { boardId, agendaEntryId, subject, periodMinutes, content } = body;

  if (!boardId || !agendaEntryId || !subject || !periodMinutes || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const lesson = await prisma.lessonPlan.create({
    data: {
      boardId,
      agendaEntryId,
      subject,
      periodMinutes,
      content: JSON.stringify(content),
    },
  });

  return NextResponse.json({ ...lesson, content });
}
