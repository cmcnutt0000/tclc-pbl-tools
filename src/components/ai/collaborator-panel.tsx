"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type {
  CollaboratorResponse,
  ProposedChange,
} from "@/lib/ai/schemas/collaborator";

const STARTERS = [
  {
    id: "hqpbl",
    icon: "\uD83D\uDCCB",
    label: "Review against HQPBL Framework",
    message:
      "Suggest improvements to the current project based on the HQPBL Framework. Evaluate each criterion and propose specific changes to strengthen weak areas.",
  },
  {
    id: "missing",
    icon: "\uD83D\uDCA1",
    label: "What am I missing?",
    message:
      "Look at this board holistically. Are there gaps, missing perspectives, untapped community connections, or overlooked Deeper Learning competencies? Propose additions or changes.",
  },
  {
    id: "time",
    icon: "\u23F1\uFE0F",
    label: "Adjust for more/less time",
    message:
      "Analyze the scope of this project. Which activities could be condensed or expanded? How could milestones be simplified or enriched? Propose changes that would make the project more realistic for the available time.",
  },
];

interface CollaboratorPanelProps {
  onDismiss: () => void;
  onSubmit: (userMessage: string) => void;
  loading: boolean;
  response: CollaboratorResponse | null;
  onAcceptChange: (change: ProposedChange) => void;
  onAcceptAll: (changes: ProposedChange[]) => void;
}

type ChangeStatus = "pending" | "accepted" | "rejected";

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export default function CollaboratorPanel({
  onDismiss,
  onSubmit,
  loading,
  response,
  onAcceptChange,
  onAcceptAll,
}: CollaboratorPanelProps) {
  const [inputText, setInputText] = useState("");
  const [changeStatuses, setChangeStatuses] = useState<
    Record<number, ChangeStatus>
  >({});

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setChangeStatuses({});
    onSubmit(text);
  }

  function handleStarterClick(message: string) {
    setChangeStatuses({});
    onSubmit(message);
  }

  function handleAccept(index: number, change: ProposedChange) {
    setChangeStatuses((prev) => ({ ...prev, [index]: "accepted" }));
    onAcceptChange(change);
  }

  function handleReject(index: number) {
    setChangeStatuses((prev) => ({ ...prev, [index]: "rejected" }));
  }

  function handleAcceptAllRemaining() {
    if (!response) return;
    const pending = response.proposedChanges.filter(
      (_, i) => changeStatuses[i] !== "accepted" && changeStatuses[i] !== "rejected",
    );
    const newStatuses = { ...changeStatuses };
    response.proposedChanges.forEach((_, i) => {
      if (!newStatuses[i]) newStatuses[i] = "accepted";
    });
    setChangeStatuses(newStatuses);
    onAcceptAll(pending);
  }

  const pendingCount = response
    ? response.proposedChanges.filter(
        (_, i) => changeStatuses[i] !== "accepted" && changeStatuses[i] !== "rejected",
      ).length
    : 0;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-stone-200 px-5 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 flex items-center gap-2">
          <span className="text-amber-500">{"\uD83D\uDCAC"}</span> AI
          Collaborator
        </h3>
        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-600 text-lg"
        >
          {"\u2715"}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 p-5 space-y-4">
        {/* Starters — shown when no response yet and not loading */}
        {!response && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">
              Quick starts
            </p>
            {STARTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStarterClick(s.message)}
                className="w-full text-left px-4 py-3 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
              >
                <span className="text-sm font-medium text-stone-700 group-hover:text-teal-700 flex items-center gap-2">
                  <span>{s.icon}</span>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone-500 mt-3">
              Analyzing your board...
            </p>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <>
            {/* AI message */}
            <div className="bg-stone-50 rounded-lg p-4">
              <div className="prose prose-sm prose-stone max-w-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5">
                <ReactMarkdown>{response.message}</ReactMarkdown>
              </div>
            </div>

            {/* Proposed changes */}
            {response.proposedChanges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">
                    Proposed Changes ({response.proposedChanges.length})
                  </p>
                  {pendingCount > 1 && (
                    <button
                      onClick={handleAcceptAllRemaining}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Accept all remaining ({pendingCount})
                    </button>
                  )}
                </div>

                {response.proposedChanges.map((change, i) => {
                  const status = changeStatuses[i] || "pending";
                  return (
                    <div
                      key={i}
                      className={
                        "rounded-lg border p-3 space-y-2 transition-colors " +
                        (status === "accepted"
                          ? "border-green-200 bg-green-50/50"
                          : status === "rejected"
                            ? "border-stone-200 bg-stone-50 opacity-50"
                            : "border-stone-200")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-stone-700">
                          {change.cellLabel}
                        </span>
                        {status === "accepted" && (
                          <span className="text-xs text-green-600 font-medium">
                            {"\u2713"} Accepted
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="text-xs text-stone-400 font-medium">
                            Dismissed
                          </span>
                        )}
                      </div>

                      {/* Diff preview */}
                      <div className="text-xs space-y-1">
                        {change.currentValue && (
                          <div className="text-stone-400">
                            <span className="font-medium">Current:</span>{" "}
                            {truncate(change.currentValue, 120)}
                          </div>
                        )}
                        <div className="text-teal-700">
                          <span className="font-medium">Proposed:</span>{" "}
                          {truncate(change.proposedValue, 120)}
                        </div>
                      </div>

                      {/* Rationale */}
                      <p className="text-xs text-stone-500 italic">
                        {change.rationale}
                      </p>

                      {/* Actions */}
                      {status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAccept(i, change)}
                            className="text-xs font-medium px-3 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            {"\u2713"} Accept
                          </button>
                          <button
                            onClick={() => handleReject(i)}
                            className="text-xs font-medium px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                          >
                            {"\u2717"} Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {response.proposedChanges.length === 0 && (
              <p className="text-xs text-stone-400 italic">
                No specific changes proposed.
              </p>
            )}
          </>
        )}
      </div>

      {/* Input area — always visible at bottom */}
      <div className="border-t border-stone-200 px-5 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              response ? "Follow up..." : "Ask anything about your board..."
            }
            className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputText.trim()}
            className={
              "text-sm font-medium px-4 py-2 rounded-lg transition-colors " +
              (loading || !inputText.trim()
                ? "bg-stone-200 text-stone-400"
                : "bg-teal-600 hover:bg-teal-700 text-white")
            }
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
