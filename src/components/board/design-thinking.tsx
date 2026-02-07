"use client";

import { useState } from "react";
import type {
  DesignThinking as DesignThinkingType,
  CellContent,
} from "@/types/board";
import { createEmptyCell } from "@/types/board";
import BoardCell from "./board-cell";

interface DesignThinkingProps {
  data: DesignThinkingType;
  onChange: (data: DesignThinkingType) => void;
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

export default function DesignThinking({
  data,
  onChange,
  onAiClick,
  onFixWithAi,
  onAddWithAi,
  onCrossCellDrop,
}: DesignThinkingProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [stepsCollapsed, setStepsCollapsed] = useState(false);
  const [milestonesCollapsed, setMilestonesCollapsed] = useState(false);
  const [additionalCollapsed, setAdditionalCollapsed] = useState(false);

  function updateCell(key: keyof DesignThinkingType, value: string) {
    onChange({ ...data, [key]: { ...data[key], value } });
  }

  function updateAdditional(index: number, value: string) {
    const updated = [...(data.additional || [])];
    updated[index] = { ...updated[index], value };
    onChange({ ...data, additional: updated });
  }

  function addAdditional() {
    onChange({
      ...data,
      additional: [
        ...(data.additional || []),
        createEmptyCell("Additional", "Custom design thinking column"),
      ],
    });
  }

  function removeAdditional(index: number) {
    onChange({
      ...data,
      additional: (data.additional || []).filter((_, i) => i !== index),
    });
  }

  return (
    <section className="mb-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        <span className="text-[10px] text-stone-600 w-3">
          {collapsed ? "\u25B6" : "\u25BC"}
        </span>
        <h2 className="font-bold text-stone-800 group-hover:text-stone-600">
          Design Thinking
        </h2>
        <span className="text-xs bg-green-800 text-green-100 px-2 py-0.5 rounded-full">
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
              onAddWithAi={(desc) =>
                onAddWithAi("drivingQuestion", data.drivingQuestion, desc)
              }
              onCrossCellDrop={onCrossCellDrop}
              sectionColor="#C8D8CE"
              phase={2}
            />
          </div>

          {/* Steps row */}
          <button
            onClick={() => setStepsCollapsed(!stepsCollapsed)}
            className="flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-[10px] text-stone-600 w-3">
              {stepsCollapsed ? "\u25B6" : "\u25BC"}
            </span>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
              Design Thinking Steps
            </h3>
          </button>
          {!stepsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-3">
              <BoardCell
                cell={data.empathize}
                cellId="empathize"
                onChange={(v) => updateCell("empathize", v)}
                onAiClick={() => onAiClick("empathize", data.empathize)}
                onFixWithAi={(fb) =>
                  onFixWithAi("empathize", data.empathize, fb)
                }
                onAddWithAi={(desc) =>
                  onAddWithAi("empathize", data.empathize, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
              <BoardCell
                cell={data.define}
                cellId="define"
                onChange={(v) => updateCell("define", v)}
                onAiClick={() => onAiClick("define", data.define)}
                onFixWithAi={(fb) => onFixWithAi("define", data.define, fb)}
                onAddWithAi={(desc) => onAddWithAi("define", data.define, desc)}
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
              <BoardCell
                cell={data.ideate}
                cellId="ideate"
                onChange={(v) => updateCell("ideate", v)}
                onAiClick={() => onAiClick("ideate", data.ideate)}
                onFixWithAi={(fb) => onFixWithAi("ideate", data.ideate, fb)}
                onAddWithAi={(desc) => onAddWithAi("ideate", data.ideate, desc)}
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
              <BoardCell
                cell={data.prototypeTest}
                cellId="prototypeTest"
                onChange={(v) => updateCell("prototypeTest", v)}
                onAiClick={() => onAiClick("prototypeTest", data.prototypeTest)}
                onFixWithAi={(fb) =>
                  onFixWithAi("prototypeTest", data.prototypeTest, fb)
                }
                onAddWithAi={(desc) =>
                  onAddWithAi("prototypeTest", data.prototypeTest, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
            </div>
          )}

          {/* Milestones row — aligned horizontally */}
          <button
            onClick={() => setMilestonesCollapsed(!milestonesCollapsed)}
            className="flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-[10px] text-stone-600 w-3">
              {milestonesCollapsed ? "\u25B6" : "\u25BC"}
            </span>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
              Milestones
            </h3>
          </button>
          {!milestonesCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                onAddWithAi={(desc) =>
                  onAddWithAi(
                    "milestoneEmpathize",
                    data.milestoneEmpathize,
                    desc,
                  )
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
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
                onAddWithAi={(desc) =>
                  onAddWithAi("milestoneDefine", data.milestoneDefine, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
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
                onAddWithAi={(desc) =>
                  onAddWithAi("milestoneIdeate", data.milestoneIdeate, desc)
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
              <BoardCell
                cell={data.milestonePrototypeTest}
                cellId="milestonePrototypeTest"
                onChange={(v) => updateCell("milestonePrototypeTest", v)}
                onAiClick={() =>
                  onAiClick(
                    "milestonePrototypeTest",
                    data.milestonePrototypeTest,
                  )
                }
                onFixWithAi={(fb) =>
                  onFixWithAi(
                    "milestonePrototypeTest",
                    data.milestonePrototypeTest,
                    fb,
                  )
                }
                onAddWithAi={(desc) =>
                  onAddWithAi(
                    "milestonePrototypeTest",
                    data.milestonePrototypeTest,
                    desc,
                  )
                }
                onCrossCellDrop={onCrossCellDrop}
                sectionColor="#C8D8CE"
                phase={2}
              />
            </div>
          )}

          {/* Additional columns */}
          {data.additional && data.additional.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setAdditionalCollapsed(!additionalCollapsed)}
                className="flex items-center gap-1.5 mb-2 group"
              >
                <span className="text-[10px] text-stone-600 w-3">
                  {additionalCollapsed ? "\u25B6" : "\u25BC"}
                </span>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide group-hover:text-stone-700">
                  Additional
                </h3>
              </button>
              {!additionalCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {data.additional.map((cell, i) => (
                    <div key={cell.id} className="relative">
                      <BoardCell
                        cell={cell}
                        cellId={"dt-additional-" + i}
                        onChange={(v) => updateAdditional(i, v)}
                        onAiClick={() => onAiClick("dt-additional-" + i, cell)}
                        onFixWithAi={(fb) =>
                          onFixWithAi("dt-additional-" + i, cell, fb)
                        }
                        onCrossCellDrop={onCrossCellDrop}
                        sectionColor="#C8D8CE"
                        phase={2}
                      />
                      <button
                        onClick={() => removeAdditional(i)}
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
              onClick={addAdditional}
              className="border-2 border-dashed border-green-200 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition-colors px-4 py-2 text-sm font-medium"
            >
              + Add Additional
            </button>
          </div>
        </>
      )}
    </section>
  );
}
