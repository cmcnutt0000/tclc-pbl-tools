import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const body = await request.json();

  const lesson = await prisma.lessonPlan.update({
    where: { id: lessonId },
    data: {
      content: body.content ? JSON.stringify(body.content) : undefined,
      periodMinutes: body.periodMinutes,
    },
  });

  return NextResponse.json({
    ...lesson,
    content: JSON.parse(lesson.content),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  await prisma.lessonPlan.delete({ where: { id: lessonId } });
  return NextResponse.json({ ok: true });
}
