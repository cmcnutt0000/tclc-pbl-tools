import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createEmptyBoardContent } from "@/types/board";

export async function GET() {
  const boards = await prisma.board.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(boards);
}

export async function POST() {
  const slug = Math.random().toString(36).substring(2, 10);
  const board = await prisma.board.create({
    data: {
      title: "Untitled Board",
      slug,
      liveblocksRoom: "board:" + slug,
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
