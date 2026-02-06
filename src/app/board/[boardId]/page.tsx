export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BoardPageClient from "./board-page-client";
import type { BoardContent, BoardContext } from "@/types/board";
import {
  createEmptyBoardContent,
  createEmptyCell,
  createStandardsCell,
  syncStandardsCells,
} from "@/types/board";

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) notFound();

  let content: BoardContent;
  try {
    const raw = JSON.parse(board.content);
    // Migrate old milestone1/2/3 format to new per-step milestones
    if (raw.designThinking && "milestone1" in raw.designThinking) {
      const dt = raw.designThinking;
      const empty = createEmptyBoardContent().designThinking;
      dt.milestoneEmpathize = dt.milestone1 || empty.milestoneEmpathize;
      dt.milestoneDefine = dt.milestone2 || empty.milestoneDefine;
      dt.milestoneIdeate = empty.milestoneIdeate;
      dt.milestonePrototypeTest = dt.milestone3 || empty.milestonePrototypeTest;
      delete dt.milestone1;
      delete dt.milestone2;
      delete dt.milestone3;
    }
    // Migrate old single-standards format to array
    if (
      raw.initialPlanning &&
      raw.initialPlanning.standards &&
      !Array.isArray(raw.initialPlanning.standards)
    ) {
      const oldStandards = raw.initialPlanning.standards;
      // Will be re-synced with subjects below
      raw.initialPlanning.standards = oldStandards.value
        ? [{ ...oldStandards, label: "Standards: General" }]
        : [];
    }
    // Migrate: add communityPartners if missing
    if (raw.initialPlanning && !raw.initialPlanning.communityPartners) {
      raw.initialPlanning.communityPartners = createEmptyCell(
        "Community Partners",
        "Local organizations, businesses, or individuals who could partner on this project",
      );
    }
    content = raw as BoardContent;
  } catch {
    content = createEmptyBoardContent();
  }

  let subjects: string[] = [];
  try {
    if (board.subjects) subjects = JSON.parse(board.subjects);
  } catch {
    /* ignore */
  }
  if (subjects.length === 0) {
    subjects = ["Math", "English Language Arts", "Science", "Social Studies"];
  }

  // Sync standards cells with subjects
  content.initialPlanning.standards = syncStandardsCells(
    content.initialPlanning.standards,
    subjects,
  );

  const context: BoardContext = {
    state: board.state || undefined,
    gradeLevel: board.gradeLevel || undefined,
    subjects,
    location: board.location || undefined,
  };

  return (
    <BoardPageClient
      boardId={board.id}
      initialTitle={board.title}
      initialContent={content}
      initialContext={context}
    />
  );
}
