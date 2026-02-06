"use client";

import CollapsibleMarkdown from "@/components/board/collapsible-markdown";

interface Suggestion {
  text: string;
  rationale: string;
}

interface SuggestionPanelProps {
  cellLabel: string;
  suggestions: Suggestion[];
  loading: boolean;
  onSelect: (text: string) => void;
  onDismiss: () => void;
}

export default function SuggestionPanel({
  cellLabel,
  suggestions,
  loading,
  onSelect,
  onDismiss,
}: SuggestionPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-5 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 text-lg">
            AI Suggestions for{" "}
            <span className="text-brand-600">{cellLabel}</span>
          </h3>
          <button
            onClick={onDismiss}
            className="text-stone-400 hover:text-stone-600 text-lg"
          >
            &#x2715;
          </button>
        </div>
        <div className="p-5 space-y-4">
          {loading && suggestions.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-base text-stone-500 mt-2">
                Generating suggestions...
              </p>
            </div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="border border-stone-200 rounded-lg p-4 hover:border-brand-300 transition-colors"
            >
              <div className="text-base text-stone-800 mb-2 leading-relaxed">
                <CollapsibleMarkdown content={s.text} defaultExpanded />
              </div>
              {s.rationale && (
                <p className="text-sm text-stone-400 italic mb-3">
                  {s.rationale}
                </p>
              )}
              <button
                onClick={() => onSelect(s.text)}
                className="text-sm bg-brand-800 hover:bg-brand-900 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Use This
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
