"use client";

import { useState } from "react";
import type {
  InitialPlanning as InitialPlanningType,
  CellContent,
} from "@/types/board";
import { createEmptyCell } from "@/types/board";
import BoardCell from "./board-cell";

interface InitialPlanningProps {
  data: InitialPlanningType;
  onChange: (data: InitialPlanningType) => void;
  onAiClick: (cellId: string, cell: CellContent) => void;
  onFixWithAi: (cellId: string, cell: CellContent, feedback: string) => void;
  onAddWithAi: (cellId: string, cell: CellContent, description: string) => void;
  onCrossCellDrop?: (
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex?: number,
  ) => void;
}

export default function InitialPlanning({
  data,
  onChange,
  onAiClick,
  onFixWithAi,
  onAddWithAi,
  onCrossCellDrop,
}: InitialPlanningProps) {
  const [conceptCollapsed, setConceptCollapsed] = useState(false);
  const [standardsCollapsed, setStandardsCollapsed] = useState(false);
  const [additionalCollapsed, setAdditionalCollapsed] = useState(false);

  function updateCell(
    key: "mainIdea" | "noticeReflect" | "communityPartners" | "openingActivity",
    value: string,
  ) {
    onChange({ ...data, [key]: { ...data[key], value } });
  }

  function updateStandard(index: number, value: string) {
    const updated = [...data.standards];
    updated[index] = { ...updated[index], value };
    onChange({ ...data, standards: updated });
  }

  function updateAdditional(index: number, value: string) {
    const updated = [...data.additional];
    updated[index] = { ...updated[index], value };
    onChange({ ...data, additional: updated });
  }

  function addColumn() {
    onChange({
      ...data,
      additional: [
        ...data.additional,
        createEmptyCell("Additional", "Custom planning column"),
      ],
    });
  }

  function removeColumn(index: number) {
    onChange({
      ...data,
      additional: data.additional.filter((_, i) => i !== index),
    });
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-bold text-stone-800">Initial Planning</h2>
        <span className="text-xs bg-brand-800 text-brand-100 px-2 py-0.5 rounded-full">
          Phase 1
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Concept group */}
        <div>
          <button
            onClick={() => setConceptCollapsed(!conceptCollapsed)}
            className="flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-[10px] text-stone-400 w-3">
              {conceptCollapsed ? "\u25B6" : "\u25BC"}
            </span>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
              Concept
            </h3>
          </button>
          {!conceptCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BoardCell
                cell={data.mainIdea}
                cellId="mainIdea"
                onChange={(v) => updateCell("mainIdea", v)}
                onAiClick={() => onAiClick("mainIdea", data.mainIdea)}
                onFixWithAi={(fb) => onFixWithAi("mainIdea", data.mainIdea, fb)}
                onAddWithAi={(desc) =>
                  onAddWithAi("mainIdea", data.mainIdea, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#D5E3ED"
                phase={1}
              />
              <BoardCell
                cell={data.noticeReflect}
                cellId="noticeReflect"
                onChange={(v) => updateCell("noticeReflect", v)}
                onAiClick={() => onAiClick("noticeReflect", data.noticeReflect)}
                onFixWithAi={(fb) =>
                  onFixWithAi("noticeReflect", data.noticeReflect, fb)
                }
                onAddWithAi={(desc) =>
                  onAddWithAi("noticeReflect", data.noticeReflect, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#D5E3ED"
                phase={1}
              />
              <BoardCell
                cell={data.openingActivity}
                cellId="openingActivity"
                onChange={(v) => updateCell("openingActivity", v)}
                onAiClick={() =>
                  onAiClick("openingActivity", data.openingActivity)
                }
                onFixWithAi={(fb) =>
                  onFixWithAi("openingActivity", data.openingActivity, fb)
                }
                onAddWithAi={(desc) =>
                  onAddWithAi("openingActivity", data.openingActivity, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#D5E3ED"
                phase={1}
              />
              <BoardCell
                cell={data.communityPartners}
                cellId="communityPartners"
                onChange={(v) => updateCell("communityPartners", v)}
                onAiClick={() =>
                  onAiClick("communityPartners", data.communityPartners)
                }
                onFixWithAi={(fb) =>
                  onFixWithAi("communityPartners", data.communityPartners, fb)
                }
                onAddWithAi={(desc) =>
                  onAddWithAi("communityPartners", data.communityPartners, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#D5E3ED"
                phase={1}
              />
            </div>
          )}
        </div>

        {/* Right: Standards group */}
        <div>
          <button
            onClick={() => setStandardsCollapsed(!standardsCollapsed)}
            className="flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-[10px] text-stone-400 w-3">
              {standardsCollapsed ? "\u25B6" : "\u25BC"}
            </span>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
              Standards by Subject
            </h3>
          </button>
          {!standardsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.standards.map((stdCell, i) => {
                const subject = stdCell.label.replace("Standards: ", "");
                return (
                  <BoardCell
                    key={stdCell.id}
                    cell={stdCell}
                    cellId={"standards-" + subject}
                    onChange={(v) => updateStandard(i, v)}
                    onAiClick={() => onAiClick("standards-" + subject, stdCell)}
                    onFixWithAi={(fb) =>
                      onFixWithAi("standards-" + subject, stdCell, fb)
                    }
                    onAddWithAi={(desc) =>
                      onAddWithAi("standards-" + subject, stdCell, desc)
                    }
                    onCrossCellDrop={onCrossCellDrop}
                    sectionColor="#D5E3ED"
                    phase={1}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Additional columns below */}
      {data.additional.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setAdditionalCollapsed(!additionalCollapsed)}
            className="flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-[10px] text-stone-400 w-3">
              {additionalCollapsed ? "\u25B6" : "\u25BC"}
            </span>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
              Additional
            </h3>
          </button>
          {!additionalCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.additional.map((cell, i) => (
                <div key={cell.id} className="relative">
                  <BoardCell
                    cell={cell}
                    cellId={"additional-" + i}
                    onChange={(v) => updateAdditional(i, v)}
                    onAiClick={() => onAiClick("additional-" + i, cell)}
                    onCrossCellDrop={onCrossCellDrop}
                    sectionColor="#D5E3ED"
                    phase={1}
                  />
                  <button
                    onClick={() => removeColumn(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-3">
        <button
          onClick={addColumn}
          className="border-2 border-dashed border-brand-200 rounded-lg text-brand-400 hover:border-brand-400 hover:text-brand-600 transition-colors px-4 py-2 text-sm font-medium"
        >
          + Add Additional
        </button>
      </div>
    </section>
  );
}
