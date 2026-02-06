"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CollapsibleMarkdown from "@/components/board/collapsible-markdown";
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
  {
    id: "research",
    icon: "\uD83D\uDCDA",
    label: "How does this align with progressive education research?",
    message:
      "Analyze this board through the lens of progressive education research. Reference specific thinkers and frameworks — John Dewey's experiential learning, Paulo Freire's critical pedagogy, bell hooks' engaged pedagogy, William Doll's post-modern curriculum theory, and Deeper Learning research. Where does this project already embody these principles? Where could it go deeper? Propose specific changes grounded in the research. Use academic language and cite the scholars directly.",
  },
];

const LOADING_MESSAGES = [
  "Reading through your design board...",
  "Evaluating against HQPBL criteria...",
  "Considering Deeper Learning competencies...",
  "Thinking about pedagogical alignment...",
  "Drafting specific recommendations...",
  "Almost there \u2014 finalizing analysis...",
];

interface CollaboratorPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onSubmit: (userMessage: string) => void;
  loading: boolean;
  response: CollaboratorResponse | null;
  onAcceptChange: (change: ProposedChange) => void;
  onAcceptAll: (changes: ProposedChange[]) => void;
}

type ChangeStatus = "pending" | "accepted" | "rejected";

/** Parse the AI message into structured sections for clean display */
function parseMessageSections(
  message: string,
): Array<{ heading: string; body: string }> {
  const lines = message.split("\n");
  const sections: Array<{ heading: string; body: string }> = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);
    const boldLineMatch = line.match(/^\*\*([^*]+)\*\*\s*$/);
    if (h2Match || h3Match || boldLineMatch) {
      if (currentHeading || currentBody.length > 0) {
        sections.push({
          heading: currentHeading,
          body: currentBody.join("\n").trim(),
        });
      }
      currentHeading = h2Match
        ? h2Match[1]
        : h3Match
          ? h3Match[1]
          : boldLineMatch![1];
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading || currentBody.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentBody.join("\n").trim(),
    });
  }
  return sections;
}

export default function CollaboratorPanel({
  collapsed,
  onToggleCollapse,
  fullscreen,
  onToggleFullscreen,
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
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [loading]);

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
      (_, i) =>
        changeStatuses[i] !== "accepted" && changeStatuses[i] !== "rejected",
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
        (_, i) =>
          changeStatuses[i] !== "accepted" && changeStatuses[i] !== "rejected",
      ).length
    : 0;

  // Collapsed state — just a vertical tab
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-amber-500 hover:bg-amber-600 text-white px-2 py-4 rounded-l-lg shadow-lg transition-colors"
        title="Open AI Collaborator"
      >
        <span className="[writing-mode:vertical-lr] text-xs font-semibold tracking-wide">
          {"\uD83D\uDCAC"} AI Collaborator
        </span>
      </button>
    );
  }

  const panelWidth = fullscreen ? "w-full" : "w-[420px]";

  return (
    <div
      className={
        "fixed inset-y-0 right-0 z-40 flex flex-col bg-white border-l border-stone-200 shadow-xl " +
        panelWidth +
        " transition-all duration-200"
      }
    >
      {/* Header */}
      <div className="border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-stone-800 flex items-center gap-2 text-sm">
          <span className="text-amber-500">{"\uD83D\uDCAC"}</span> AI
          Collaborator
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleFullscreen}
            className="text-stone-400 hover:text-stone-600 p-1 rounded hover:bg-stone-100 transition-colors"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18-5h-3a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
          <button
            onClick={onToggleCollapse}
            className="text-stone-400 hover:text-stone-600 p-1 rounded hover:bg-stone-100 transition-colors"
            title="Collapse sidebar"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {/* Starters — shown when no response yet and not loading */}
        {!response && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">
              Quick starts
            </p>
            {STARTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStarterClick(s.message)}
                className="w-full text-left px-4 py-3 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
              >
                <span className="text-sm font-medium text-stone-700 group-hover:text-teal-700 flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-stone-600 mt-4">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <p className="text-xs text-stone-400 mt-2">
              This may take a minute or two {"\u2014"} we{"\u2019"}re doing a
              deep analysis of your entire board.
            </p>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <>
            {/* AI message — parsed into structured sections */}
            {(() => {
              const sections = parseMessageSections(response.message);
              // If there's only one section with no heading, render as a simple box
              if (
                sections.length === 1 &&
                !sections[0].heading &&
                sections[0].body
              ) {
                return (
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-100">
                    <div className="prose prose-stone max-w-none text-sm leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-3">
                      <ReactMarkdown>{response.message}</ReactMarkdown>
                    </div>
                  </div>
                );
              }
              // Multiple sections — render as grouped boxes
              return (
                <div className="space-y-3">
                  {sections.map((section, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-stone-100 overflow-hidden"
                    >
                      {section.heading && (
                        <div className="bg-stone-100 px-4 py-2">
                          <h4 className="text-sm font-semibold text-stone-800">
                            {section.heading}
                          </h4>
                        </div>
                      )}
                      {section.body && (
                        <div className="px-4 py-3 bg-white">
                          <div className="prose prose-stone max-w-none text-sm leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2 [&>p:last-child]:mb-0">
                            <ReactMarkdown>{section.body}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Proposed changes */}
            {response.proposedChanges.length > 0 && (
              <div className="space-y-3 mt-5 bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-amber-700 uppercase tracking-wide font-semibold">
                    Proposed Changes ({response.proposedChanges.length})
                  </h4>
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
                        "rounded-lg border overflow-hidden transition-colors " +
                        (status === "accepted"
                          ? "border-green-200 bg-green-50/30"
                          : status === "rejected"
                            ? "border-stone-200 bg-stone-50 opacity-40"
                            : "border-stone-200")
                      }
                    >
                      {/* Change header */}
                      <div
                        className={
                          "px-4 py-2 flex items-center justify-between " +
                          (status === "accepted"
                            ? "bg-green-100/50"
                            : "bg-stone-50")
                        }
                      >
                        <span className="text-sm font-semibold text-stone-800">
                          {change.cellLabel}
                        </span>
                        {status === "accepted" && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            {"\u2713"} Applied
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="text-xs text-stone-400 font-medium">
                            Dismissed
                          </span>
                        )}
                      </div>

                      {/* Change body */}
                      <div className="px-4 py-3 space-y-2">
                        {/* Diff preview */}
                        {change.currentValue && (
                          <div className="text-sm text-stone-500 bg-stone-50 rounded px-3 py-2 leading-relaxed">
                            <p className="font-semibold text-stone-600 mb-1">
                              Current:
                            </p>
                            <CollapsibleMarkdown
                              content={change.currentValue}
                            />
                          </div>
                        )}
                        <div className="text-sm text-teal-800 bg-teal-50 rounded px-3 py-2 leading-relaxed">
                          <p className="font-semibold text-teal-700 mb-1">
                            Proposed:
                          </p>
                          <CollapsibleMarkdown content={change.proposedValue} />
                        </div>

                        {/* Rationale */}
                        <p className="text-sm text-stone-500 italic leading-relaxed">
                          {change.rationale}
                        </p>

                        {/* Actions */}
                        {status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleAccept(i, change)}
                              className="text-sm font-medium px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                            >
                              {"\u2713"} Accept
                            </button>
                            <button
                              onClick={() => handleReject(i)}
                              className="text-sm font-medium px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                            >
                              {"\u2717"} Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {response.proposedChanges.length === 0 && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-700">
                  No changes needed {"\u2014"} your board looks strong!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area — always visible at bottom */}
      <div className="border-t border-stone-200 px-4 py-3 shrink-0">
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
