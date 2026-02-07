import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { createEmptyBoardContent } from "@/types/board";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const boards = await prisma.board.findMany({
    where: { userId: session.user.sub },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(boards);
}

export async function POST() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = Math.random().toString(36).substring(2, 10);
  const board = await prisma.board.create({
    data: {
      title: "Untitled Board",
      slug,
      liveblocksRoom: "board:" + slug,
      userId: session.user.sub,
      content: JSON.stringify(createEmptyBoardContent()),
      subjects: JSON.stringify([
        "Math",
        "English Language Arts",
        "Science",
        "Social Studies",
      ]),
    },
  });
  return NextResponse.json(board);
}
