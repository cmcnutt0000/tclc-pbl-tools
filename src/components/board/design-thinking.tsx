"use client";

import { useState } from "react";
import type {
  DesignThinking as DesignThinkingType,
  CellContent,
} from "@/types/board";
import BoardCell from "./board-cell";

interface DesignThinkingProps {
  data: DesignThinkingType;
  onChange: (data: DesignThinkingType) => void;
  onAiClick: (cellId: string, cell: CellContent) => void;
  onFixWithAi: (cellId: string, cell: CellContent, feedback: string) => void;
  onCrossCellDrop?: (
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex?: number,
  ) => void;
}

export default function DesignThinking({
  data,
  onChange,
  onAiClick,
  onFixWithAi,
  onCrossCellDrop,
}: DesignThinkingProps) {
  const [collapsed, setCollapsed] = useState(false);

  function updateCell(key: keyof DesignThinkingType, value: string) {
    onChange({ ...data, [key]: { ...data[key], value } });
  }

  return (
    <section className="mb-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        <span className="text-[10px] text-stone-400 w-3">
          {collapsed ? "\u25B6" : "\u25BC"}
        </span>
        <h2 className="text-lg font-bold text-stone-800 group-hover:text-stone-600">
          Design Thinking
        </h2>
        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
          Phase 2
        </span>
      </button>

      {!collapsed && (
        <>
          {/* Driving Question — full width */}
          <div className="mb-3">
            <BoardCell
              cell={data.drivingQuestion}
              cellId="drivingQuestion"
              onChange={(v) => updateCell("drivingQuestion", v)}
              onAiClick={() =>
                onAiClick("drivingQuestion", data.drivingQuestion)
              }
              onFixWithAi={(fb) =>
                onFixWithAi("drivingQuestion", data.drivingQuestion, fb)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#ffe4e6"
            />
          </div>

          {/* Steps row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
            <BoardCell
              cell={data.empathize}
              cellId="empathize"
              onChange={(v) => updateCell("empathize", v)}
              onAiClick={() => onAiClick("empathize", data.empathize)}
              onFixWithAi={(fb) => onFixWithAi("empathize", data.empathize, fb)}
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#ffe4e6"
            />
            <BoardCell
              cell={data.define}
              cellId="define"
              onChange={(v) => updateCell("define", v)}
              onAiClick={() => onAiClick("define", data.define)}
              onFixWithAi={(fb) => onFixWithAi("define", data.define, fb)}
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#ffe4e6"
            />
            <BoardCell
              cell={data.ideate}
              cellId="ideate"
              onChange={(v) => updateCell("ideate", v)}
              onAiClick={() => onAiClick("ideate", data.ideate)}
              onFixWithAi={(fb) => onFixWithAi("ideate", data.ideate, fb)}
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#ffe4e6"
            />
            <BoardCell
              cell={data.prototypeTest}
              cellId="prototypeTest"
              onChange={(v) => updateCell("prototypeTest", v)}
              onAiClick={() => onAiClick("prototypeTest", data.prototypeTest)}
              onFixWithAi={(fb) =>
                onFixWithAi("prototypeTest", data.prototypeTest, fb)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#ffe4e6"
            />
          </div>

          {/* Milestones row — aligned horizontally */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <BoardCell
              cell={data.milestoneEmpathize}
              cellId="milestoneEmpathize"
              onChange={(v) => updateCell("milestoneEmpathize", v)}
              onAiClick={() =>
                onAiClick("milestoneEmpathize", data.milestoneEmpathize)
              }
              onFixWithAi={(fb) =>
                onFixWithAi("milestoneEmpathize", data.milestoneEmpathize, fb)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#fef3c7"
            />
            <BoardCell
              cell={data.milestoneDefine}
              cellId="milestoneDefine"
              onChange={(v) => updateCell("milestoneDefine", v)}
              onAiClick={() =>
                onAiClick("milestoneDefine", data.milestoneDefine)
              }
              onFixWithAi={(fb) =>
                onFixWithAi("milestoneDefine", data.milestoneDefine, fb)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#fef3c7"
            />
            <BoardCell
              cell={data.milestoneIdeate}
              cellId="milestoneIdeate"
              onChange={(v) => updateCell("milestoneIdeate", v)}
              onAiClick={() =>
                onAiClick("milestoneIdeate", data.milestoneIdeate)
              }
              onFixWithAi={(fb) =>
                onFixWithAi("milestoneIdeate", data.milestoneIdeate, fb)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#fef3c7"
            />
            <BoardCell
              cell={data.milestonePrototypeTest}
              cellId="milestonePrototypeTest"
              onChange={(v) => updateCell("milestonePrototypeTest", v)}
              onAiClick={() =>
                onAiClick("milestonePrototypeTest", data.milestonePrototypeTest)
              }
              onFixWithAi={(fb) =>
                onFixWithAi(
                  "milestonePrototypeTest",
                  data.milestonePrototypeTest,
                  fb,
                )
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#fef3c7"
            />
          </div>
        </>
      )}
    </section>
  );
}
