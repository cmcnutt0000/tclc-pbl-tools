"use client";

import { useState, useRef, useEffect } from "react";
import type { CellContent } from "@/types/board";
import CollapsibleMarkdown from "./collapsible-markdown";

const CELL_ICONS: Record<string, string> = {
  "Main Idea / Topic": "\uD83C\uDFAF",
  "Notice & Reflect": "\uD83D\uDD0D",
  "Opening Activity": "\uD83C\uDFAC",
  "Community Partners": "\uD83E\uDD1D",
  "Driving Question": "\u2753",
  Empathize: "\u2764\uFE0F",
  Define: "\uD83C\uDFAF",
  Ideate: "\uD83D\uDCA1",
  "Prototype & Test": "\uD83D\uDD27",
  "Milestone: Empathize": "\uD83C\uDFC1",
  "Milestone: Define": "\uD83C\uDFC1",
  "Milestone: Ideate": "\uD83C\uDFC1",
  "Milestone: Prototype & Test": "\uD83C\uDFC1",
};

function getCellIcon(label: string): string {
  if (CELL_ICONS[label]) return CELL_ICONS[label];
  if (label.startsWith("Standards")) return "\uD83D\uDCDA";
  if (label.startsWith("Milestone")) return "\uD83C\uDFC1";
  return "";
}

interface BoardCellProps {
  cell: CellContent;
  cellId: string;
  onChange: (value: string) => void;
  onAiClick: () => void;
  onFixWithAi?: (feedback: string) => void;
  onAddWithAi?: (description: string) => void;
  onCrossCellDrop?: (
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex?: number,
  ) => void;
  sectionColor?: string;
}

export default function BoardCell({
  cell,
  cellId,
  onChange,
  onAiClick,
  onFixWithAi,
  onAddWithAi,
  onCrossCellDrop,
  sectionColor,
}: BoardCellProps) {
  const [editing, setEditing] = useState(false);
  const [aiMenu, setAiMenu] = useState(false);
  const [showFixInput, setShowFixInput] = useState(false);
  const [fixFeedback, setFixFeedback] = useState("");
  const [fixLoading, setFixLoading] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addDescription, setAddDescription] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [editing, cell.value]);

  // Close menu on outside click
  useEffect(() => {
    if (!aiMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAiMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aiMenu]);

  function handleAiButtonClick() {
    if (cell.value && onFixWithAi) {
      // Cell has content and improve is available — show menu
      setAiMenu(!aiMenu);
    } else {
      // Cell is empty — go straight to generate
      onAiClick();
    }
  }

  function handleCellDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes("application/x-pbl-section")) {
      e.preventDefault();
      setDragOver(true);
    }
  }

  function handleCellDragLeave() {
    setDragOver(false);
  }

  function handleCellDrop(e: React.DragEvent) {
    setDragOver(false);
    const transferData = e.dataTransfer.getData("application/x-pbl-section");
    if (!transferData) return;
    try {
      const data = JSON.parse(transferData);
      if (
        data.sourceCellId &&
        data.sourceCellId !== cellId &&
        onCrossCellDrop
      ) {
        e.preventDefault();
        e.stopPropagation();
        onCrossCellDrop(data.sourceCellId, data.rawLines, cellId);
      }
    } catch {}
  }

  const containerClass =
    "group relative rounded-lg border transition-all " +
    (editing
      ? "border-teal-400 ring-2 ring-teal-100 shadow-md"
      : dragOver
        ? "border-teal-400 ring-2 ring-teal-100 bg-teal-50/30"
        : "border-stone-200 hover:border-stone-300 hover:shadow-sm");

  return (
    <div
      className={containerClass}
      style={{
        backgroundColor: dragOver ? undefined : sectionColor || "white",
      }}
      onDragOver={handleCellDragOver}
      onDragLeave={handleCellDragLeave}
      onDrop={handleCellDrop}
    >
      <div className="px-3 pt-3 pb-1.5 flex items-start justify-between">
        <div
          onDoubleClick={() => setEditing(true)}
          className="cursor-text"
          title="Double-click to edit entire cell"
        >
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide flex items-center gap-1.5 cursor-text">
            {getCellIcon(cell.label) && (
              <span className="text-sm not-italic">
                {getCellIcon(cell.label)}
              </span>
            )}
            {cell.label}
          </label>
          {cell.subtitle && (
            <p className="text-xs text-stone-400 mt-0.5">{cell.subtitle}</p>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleAiButtonClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
            title="AI options"
          >
            &#x2728; AI
          </button>
          {aiMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
              <button
                onClick={() => {
                  setAiMenu(false);
                  onAiClick();
                }}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-stone-50 text-stone-700"
              >
                &#x2728; Generate new
              </button>
              <button
                onClick={() => {
                  setAiMenu(false);
                  setShowFixInput(true);
                }}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-stone-50 text-stone-700"
              >
                &#x270F;&#xFE0F; Improve current
              </button>
              {onAddWithAi && (
                <button
                  onClick={() => {
                    setAiMenu(false);
                    setShowAddInput(true);
                  }}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-stone-50 text-stone-700"
                >
                  &#x2795; Add section
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={cell.value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          className="w-full px-3 pb-4 bg-transparent resize-none text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none min-h-[60px]"
          placeholder={"Enter " + cell.label.toLowerCase() + "..."}
          rows={2}
        />
      ) : (
        <div className="w-full px-3 pb-4 text-sm text-stone-800 min-h-[60px]">
          {cell.value ? (
            <CollapsibleMarkdown
              content={cell.value}
              onChange={onChange}
              cellId={cellId}
              onCrossCellDrop={onCrossCellDrop}
            />
          ) : (
            <p
              className="text-stone-300 cursor-text"
              onDoubleClick={() => setEditing(true)}
            >
              {"Enter " + cell.label.toLowerCase() + "..."}
            </p>
          )}
        </div>
      )}

      {/* Add section button */}
      {!editing && cell.value && (
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              const newSection = "\n- **New Section**\n  - Add details here";
              onChange(cell.value.trimEnd() + newSection);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-stone-400 hover:text-teal-600 font-medium flex items-center gap-1"
          >
            + Add section
          </button>
        </div>
      )}

      {showFixInput && onFixWithAi && (
        <div className="px-3 pb-2">
          <div className="space-y-2">
            <textarea
              value={fixFeedback}
              onChange={(e) => setFixFeedback(e.target.value)}
              placeholder="What would you like changed?"
              className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-teal-400 bg-white"
              rows={2}
              disabled={fixLoading}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!fixFeedback.trim()) return;
                  setFixLoading(true);
                  await onFixWithAi(fixFeedback);
                  setFixLoading(false);
                  setShowFixInput(false);
                  setFixFeedback("");
                }}
                disabled={fixLoading || !fixFeedback.trim()}
                className={
                  "text-xs px-2 py-1 rounded font-medium " +
                  (fixLoading || !fixFeedback.trim()
                    ? "bg-stone-200 text-stone-400"
                    : "bg-teal-600 hover:bg-teal-700 text-white")
                }
              >
                {fixLoading ? "Improving..." : "\u2728 Improve"}
              </button>
              <button
                onClick={() => {
                  setShowFixInput(false);
                  setFixFeedback("");
                }}
                disabled={fixLoading}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddInput && onAddWithAi && (
        <div className="px-3 pb-2">
          <div className="space-y-2">
            <textarea
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              placeholder="Describe what to add (e.g. 'a journaling activity')"
              className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-teal-400 bg-white"
              rows={2}
              disabled={addLoading}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!addDescription.trim()) return;
                  setAddLoading(true);
                  await onAddWithAi(addDescription);
                  setAddLoading(false);
                  setShowAddInput(false);
                  setAddDescription("");
                }}
                disabled={addLoading || !addDescription.trim()}
                className={
                  "text-xs px-2 py-1 rounded font-medium " +
                  (addLoading || !addDescription.trim()
                    ? "bg-stone-200 text-stone-400"
                    : "bg-teal-600 hover:bg-teal-700 text-white")
                }
              >
                {addLoading ? "Adding..." : "\u2795 Add"}
              </button>
              <button
                onClick={() => {
                  setShowAddInput(false);
                  setAddDescription("");
                }}
                disabled={addLoading}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
