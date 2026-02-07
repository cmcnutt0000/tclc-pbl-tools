"use client";

import { useState } from "react";

interface LessonGeneratorProps {
  subjects: string[];
  onGenerate: (
    selections: Array<{ subject: string; periodMinutes: number }>,
  ) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function LessonGenerator({
  subjects,
  onGenerate,
  onCancel,
  loading,
}: LessonGeneratorProps) {
  const [selections, setSelections] = useState(
    subjects.map((s) => ({ subject: s, selected: true, periodMinutes: 50 })),
  );

  function toggleSubject(index: number) {
    const updated = [...selections];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setSelections(updated);
  }

  function setPeriod(index: number, minutes: number) {
    const updated = [...selections];
    updated[index] = {
      ...updated[index],
      periodMinutes: Math.max(15, Math.min(120, minutes)),
    };
    setSelections(updated);
  }

  function handleGenerate() {
    const selected = selections
      .filter((s) => s.selected)
      .map(({ subject, periodMinutes }) => ({ subject, periodMinutes }));
    if (selected.length > 0) {
      onGenerate(selected);
    }
  }

  const anySelected = selections.some((s) => s.selected);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm space-y-3 mt-2">
      <h4 className="font-semibold text-stone-800 text-xs">
        Generate Lesson Plans
      </h4>
      <p className="text-[10px] text-stone-500">
        Select subjects and set period lengths. A separate lesson plan will be
        generated for each.
      </p>
      <div className="space-y-2">
        {selections.map((sel, i) => (
          <div key={sel.subject} className="flex items-center gap-3">
            <label className="flex items-center gap-2 flex-1 text-sm">
              <input
                type="checkbox"
                checked={sel.selected}
                onChange={() => toggleSubject(i)}
                disabled={loading}
                className="rounded border-stone-300"
              />
              <span className="text-stone-700">{sel.subject}</span>
            </label>
            {sel.selected && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={sel.periodMinutes}
                  onChange={(e) =>
                    setPeriod(i, parseInt(e.target.value) || 50)
                  }
                  disabled={loading}
                  className="w-16 text-sm border border-stone-200 rounded px-2 py-1"
                />
                <span className="text-[10px] text-stone-400">min</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleGenerate}
          disabled={loading || !anySelected}
          className={
            "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors " +
            (loading || !anySelected
              ? "bg-stone-300 text-stone-500"
              : "bg-brand-800 hover:bg-brand-900 text-white")
          }
        >
          {loading
            ? "Generating..."
            : "Generate " +
              selections.filter((s) => s.selected).length +
              " Lesson(s)"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
