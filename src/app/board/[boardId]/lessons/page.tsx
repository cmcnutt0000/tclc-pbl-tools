export const dynamic = "force-dynamic";
import { auth0 } from "@/lib/auth0";
import { notFound } from "next/navigation";
import { loadBoard } from "@/lib/load-board";
import { prisma } from "@/lib/db";
import type { LessonPlan } from "@/types/board";
import LessonsPageClient from "./lessons-page-client";

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function LessonsPage({ params }: Props) {
  const { boardId } = await params;
  const session = await auth0.getSession();
  const result = await loadBoard(boardId);
  if (!result) notFound();

  const { board, content, context } = result;

  // Verify board belongs to the logged-in user (or is unowned)
  if (board.userId && session?.user?.sub && board.userId !== session.user.sub) {
    notFound();
  }

  // Load all lessons for this board
  const dbLessons = await prisma.lessonPlan.findMany({
    where: { boardId },
    orderBy: [{ agendaEntryId: "asc" }, { subject: "asc" }],
  });

  const lessons: LessonPlan[] = dbLessons.map((l) => ({
    ...l,
    content: JSON.parse(l.content),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <LessonsPageClient
      boardId={board.id}
      boardTitle={board.title}
      boardContent={content}
      boardContext={context}
      initialLessons={lessons}
    />
  );
}
