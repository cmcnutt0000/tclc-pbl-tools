import { prisma } from "@/lib/db";
import type { BoardContent, BoardContext } from "@/types/board";
import {
  createEmptyBoardContent,
  createEmptyCell,
  syncStandardsCells,
} from "@/types/board";

export async function loadBoard(boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return null;

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
    // Ensure additional arrays exist
    if (raw.initialPlanning && !raw.initialPlanning.additional) {
      raw.initialPlanning.additional = [];
    }
    if (raw.designThinking && !raw.designThinking.additional) {
      raw.designThinking.additional = [];
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

  return { board, content, context };
}
