"use client";

import { useState } from "react";
import type { AgendaEntry } from "@/types/board";
import { createEmptyAgendaEntry } from "@/types/board";
import CollapsibleMarkdown from "./collapsible-markdown";

interface AgendaProps {
  entries: AgendaEntry[];
  onChange: (entries: AgendaEntry[]) => void;
  onGenerateAgenda?: (numDays: number) => void;
  onFixWithAi?: (
    entryIndex: number,
    field: string,
    feedback: string,
  ) => Promise<void>;
  agendaLoading?: boolean;
  boardComplete?: boolean;
}

function AiImproveButton({
  onSubmit,
}: {
  onSubmit: (feedback: string) => Promise<void>;
}) {
  const [showInput, setShowInput] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="opacity-0 group-hover/entry:opacity-100 transition-opacity text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
        title="Improve with AI"
      >
        &#x2728; AI
      </button>
    );
  }

  return (
    <div className="space-y-1.5 mt-1">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="What would you like changed?"
        className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-brand-400 bg-white"
        rows={2}
        disabled={loading}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={async () => {
            if (!feedback.trim()) return;
            setLoading(true);
            await onSubmit(feedback);
            setLoading(false);
            setShowInput(false);
            setFeedback("");
          }}
          disabled={loading || !feedback.trim()}
          className={
            "text-xs px-2 py-1 rounded font-medium " +
            (loading || !feedback.trim()
              ? "bg-stone-200 text-stone-400"
              : "bg-brand-800 hover:bg-brand-900 text-white")
          }
        >
          {loading ? "Improving..." : "\u2728 Improve"}
        </button>
        <button
          onClick={() => {
            setShowInput(false);
            setFeedback("");
          }}
          disabled={loading}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Agenda({
  entries,
  onChange,
  onGenerateAgenda,
  onFixWithAi,
  agendaLoading,
  boardComplete,
}: AgendaProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showDayInput, setShowDayInput] = useState(false);
  const [numDays, setNumDays] = useState(10);
  const [editingContent, setEditingContent] = useState<number | null>(null);
  const [editingReflection, setEditingReflection] = useState<number | null>(
    null,
  );

  function updateEntry(index: number, field: keyof AgendaEntry, value: string) {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function addEntry() {
    onChange([...entries, createEmptyAgendaEntry()]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return;
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 group"
        >
          <span className="text-[10px] text-stone-400 w-3">
            {collapsed ? "\u25B6" : "\u25BC"}
          </span>
          <h2 className="text-lg font-bold text-stone-800 group-hover:text-stone-600">
            Agenda
          </h2>
        </button>
        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
          Sessions
        </span>
        {onGenerateAgenda && (
          <>
            {showDayInput ? (
              <div className="flex items-center gap-2">
                <label className="text-xs text-stone-500">School days:</label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={numDays}
                  onChange={(e) =>
                    setNumDays(Math.max(3, parseInt(e.target.value) || 3))
                  }
                  className="w-16 text-sm border border-stone-200 rounded px-2 py-1"
                  disabled={agendaLoading}
                />
                <button
                  onClick={() => {
                    onGenerateAgenda(numDays);
                    setShowDayInput(false);
                  }}
                  disabled={agendaLoading}
                  className={
                    "text-xs font-semibold px-3 py-1 rounded-lg transition-colors " +
                    (agendaLoading
                      ? "bg-stone-300 text-stone-500"
                      : "bg-brand-800 hover:bg-brand-900 text-white")
                  }
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowDayInput(false)}
                  disabled={agendaLoading}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDayInput(true)}
                disabled={!boardComplete || agendaLoading}
                title={
                  !boardComplete
                    ? "Complete all board sections first"
                    : undefined
                }
                className={
                  "text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 " +
                  (!boardComplete || agendaLoading
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "bg-brand-800 hover:bg-brand-900 text-white")
                }
              >
                <span>&#x2728;</span> AI Plan Agenda
              </button>
            )}
          </>
        )}
      </div>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="group/entry rounded-lg border border-stone-200 p-3 space-y-2"
              style={{ backgroundColor: "#E3D9C7" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">
                  {"Session " + (i + 1)}
                </span>
                {entries.length > 1 && (
                  <button
                    onClick={() => removeEntry(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              {entry.date && (
                <div className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded inline-block uppercase tracking-wide">
                  {entry.date}
                </div>
              )}
              <input
                type="text"
                value={entry.leads}
                onChange={(e) => updateEntry(i, "leads", e.target.value)}
                placeholder="Session title"
                className="w-full text-sm font-medium border border-stone-200 rounded px-2 py-1 bg-white"
              />
              <div className="min-h-[60px]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wide">
                    Activities
                  </label>
                  {onFixWithAi && entry.eventsContent && (
                    <AiImproveButton
                      onSubmit={(fb) => onFixWithAi(i, "eventsContent", fb)}
                    />
                  )}
                </div>
                {editingContent === i ? (
                  <textarea
                    value={entry.eventsContent}
                    onChange={(e) =>
                      updateEntry(i, "eventsContent", e.target.value)
                    }
                    onBlur={() => setEditingContent(null)}
                    autoFocus
                    className="w-full text-sm border border-stone-200 rounded px-2 py-1 bg-white resize-none min-h-[60px]"
                    rows={4}
                  />
                ) : entry.eventsContent ? (
                  <div
                    onDoubleClick={() => setEditingContent(i)}
                    className="text-sm text-stone-800 cursor-default"
                    title="Double-click to edit"
                  >
                    <CollapsibleMarkdown
                      content={entry.eventsContent}
                      onChange={(val) => updateEntry(i, "eventsContent", val)}
                    />
                  </div>
                ) : (
                  <textarea
                    value={entry.eventsContent}
                    onChange={(e) =>
                      updateEntry(i, "eventsContent", e.target.value)
                    }
                    placeholder="Activities and content"
                    className="w-full text-sm border border-stone-200 rounded px-2 py-1 bg-white resize-none min-h-[60px]"
                    rows={3}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wide">
                    Reflection
                  </label>
                  {onFixWithAi && entry.reflection && (
                    <AiImproveButton
                      onSubmit={(fb) => onFixWithAi(i, "reflection", fb)}
                    />
                  )}
                </div>
                {editingReflection === i ? (
                  <textarea
                    value={entry.reflection}
                    onChange={(e) =>
                      updateEntry(i, "reflection", e.target.value)
                    }
                    onBlur={() => setEditingReflection(null)}
                    autoFocus
                    className="w-full text-sm border border-stone-200 rounded px-2 py-1 bg-white resize-none min-h-[40px]"
                    rows={2}
                  />
                ) : entry.reflection ? (
                  <div
                    onDoubleClick={() => setEditingReflection(i)}
                    className="text-sm text-stone-600 cursor-default"
                    title="Double-click to edit"
                  >
                    <CollapsibleMarkdown
                      content={entry.reflection}
                      onChange={(val) => updateEntry(i, "reflection", val)}
                    />
                  </div>
                ) : (
                  <textarea
                    value={entry.reflection}
                    onChange={(e) =>
                      updateEntry(i, "reflection", e.target.value)
                    }
                    placeholder="Reflection prompt"
                    className="w-full text-sm border border-stone-200 rounded px-2 py-1 bg-white resize-none min-h-[40px]"
                    rows={2}
                  />
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addEntry}
            className="border-2 border-dashed border-brand-200 rounded-lg text-brand-400 hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center min-h-[200px] text-sm font-medium"
          >
            + Add Session
          </button>
        </div>
      )}
    </section>
  );
}
