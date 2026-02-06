"use client";

import type { BoardContent, BoardContext, CellContent } from "@/types/board";
import InitialPlanning from "./initial-planning";
import DesignThinking from "./design-thinking";
import Agenda from "./agenda";

interface DesignBoardProps {
  content: BoardContent;
  context: BoardContext;
  onChange: (content: BoardContent) => void;
  onAiCellClick: (cellId: string, cell: CellContent) => void;
  onFixWithAi: (cellId: string, cell: CellContent, feedback: string) => void;
  onAddWithAi: (cellId: string, cell: CellContent, description: string) => void;
  onCrossCellDrop?: (
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex?: number,
  ) => void;
  onFixWithAiAgenda?: (
    entryIndex: number,
    field: string,
    feedback: string,
  ) => Promise<void>;
  onGenerateBoard: () => void;
  onGenerateTitle?: () => void;
  titleLoading?: boolean;
  onGenerateAgenda?: (numDays: number) => void;
  agendaLoading?: boolean;
  boardComplete?: boolean;
  boardTitle: string;
  onTitleChange: (title: string) => void;
  disabled?: boolean;
  canGenerateBoard?: boolean;
  canGenerateTitle?: boolean;
}

export default function DesignBoard({
  content,
  context,
  onChange,
  onAiCellClick,
  onFixWithAi,
  onAddWithAi,
  onCrossCellDrop,
  onFixWithAiAgenda,
  onGenerateBoard,
  onGenerateTitle,
  titleLoading,
  onGenerateAgenda,
  agendaLoading,
  boardComplete,
  boardTitle,
  onTitleChange,
  disabled,
  canGenerateBoard,
  canGenerateTitle,
}: DesignBoardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto group/title">
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-3xl font-bold text-stone-800 bg-transparent border-b-2 border-transparent hover:border-stone-200 focus:border-brand-400 focus:outline-none px-1 py-0.5 w-full sm:w-auto font-[var(--font-display)]"
            placeholder="Untitled Board"
            disabled={disabled}
          />
          {onGenerateTitle && (
            <button
              onClick={onGenerateTitle}
              disabled={disabled || !canGenerateTitle || titleLoading}
              title={
                !canGenerateTitle
                  ? "Fill in the Main Idea first"
                  : "Generate a title with AI"
              }
              className={
                "opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap " +
                (disabled || !canGenerateTitle || titleLoading
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-700")
              }
            >
              {titleLoading ? "Generating..." : "\u2728 Generate Title"}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGenerateBoard()}
            disabled={disabled || !canGenerateBoard}
            title={
              !canGenerateBoard ? "Fill in at least 2 cells first" : undefined
            }
            className={
              "font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 " +
              (disabled || !canGenerateBoard
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-brand-800 hover:bg-brand-900 text-white")
            }
          >
            <span>&#x2728;</span> AI Generate Full Board
          </button>
        </div>
      </div>
      {disabled && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 mb-6 text-sm text-brand-800">
          Please fill in your project context above (state, grade level, and at
          least one subject) to begin designing.
        </div>
      )}
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <InitialPlanning
          data={content.initialPlanning}
          onChange={(ip) => onChange({ ...content, initialPlanning: ip })}
          onAiClick={onAiCellClick}
          onFixWithAi={onFixWithAi}
          onAddWithAi={onAddWithAi}
          onCrossCellDrop={onCrossCellDrop}
        />
        <DesignThinking
          data={content.designThinking}
          onChange={(dt) => onChange({ ...content, designThinking: dt })}
          onAiClick={onAiCellClick}
          onFixWithAi={onFixWithAi}
          onAddWithAi={onAddWithAi}
          onCrossCellDrop={onCrossCellDrop}
        />
        <Agenda
          entries={content.agenda}
          onChange={(agenda) => onChange({ ...content, agenda })}
          onGenerateAgenda={onGenerateAgenda}
          onFixWithAi={onFixWithAiAgenda}
          agendaLoading={agendaLoading}
          boardComplete={boardComplete}
        />
      </div>
    </div>
  );
}
