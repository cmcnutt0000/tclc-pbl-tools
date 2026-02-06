import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(board);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const body = await request.json();
  const board = await prisma.board.update({
    where: { id: boardId },
    data: {
      title: body.title,
      state: body.state,
      gradeLevel: body.gradeLevel,
      subjects: body.subjects ? JSON.stringify(body.subjects) : null,
      location: body.location,
      content: body.content ? JSON.stringify(body.content) : undefined,
    },
  });
  return NextResponse.json(board);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  await prisma.board.delete({ where: { id: boardId } });
  return NextResponse.json({ ok: true });
}