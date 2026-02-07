"use client";

import { useState } from "react";
import type { LessonPlan, LessonPlanContent } from "@/types/board";
import CollapsibleMarkdown from "./collapsible-markdown";

interface LessonPlanCardProps {
  lesson: LessonPlan;
  onUpdate: (lessonId: string, content: LessonPlanContent) => void;
  onDelete: (lessonId: string) => void;
  onRegenerate: (lesson: LessonPlan) => void;
  onImproveSection?: (
    lesson: LessonPlan,
    sectionKey: keyof LessonPlanContent,
    feedback: string,
  ) => Promise<void>;
}

const LESSON_SECTIONS: Array<{
  key: keyof LessonPlanContent;
  label: string;
}> = [
  { key: "learningObjectives", label: "Learning Objectives" },
  { key: "materials", label: "Materials Needed" },
  { key: "warmUpHook", label: "Warm-Up / Hook" },
  { key: "mainActivities", label: "Main Activities" },
  { key: "closingExitTicket", label: "Closing / Exit Ticket" },
  { key: "differentiationNotes", label: "Differentiation" },
  { key: "standardsAddressed", label: "Standards Addressed" },
];

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
        className="opacity-0 group-hover/section:opacity-100 transition-opacity text-[10px] bg-brand-100 hover:bg-brand-200 text-brand-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
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

export default function LessonPlanCard({
  lesson,
  onUpdate,
  onDelete,
  onRegenerate,
  onImproveSection,
}: LessonPlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  function handleSectionChange(key: keyof LessonPlanContent, value: string) {
    const updatedContent = { ...lesson.content, [key]: value };
    onUpdate(lesson.id, updatedContent);
  }

  return (
    <div className="group/lesson border border-stone-200 rounded-lg bg-white overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-stone-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-600 w-3">
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
          <span className="text-sm font-medium text-stone-800">
            {lesson.subject}
          </span>
          <span className="text-[10px] text-stone-400">
            {lesson.periodMinutes} min
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(lesson);
            }}
            className="opacity-0 group-hover/lesson:opacity-100 text-[10px] bg-brand-100 hover:bg-brand-200 text-brand-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-opacity"
            title="Regenerate this lesson"
          >
            &#x2728; Regenerate
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this lesson plan?")) onDelete(lesson.id);
            }}
            className="opacity-0 group-hover/lesson:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
            title="Delete lesson"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-3 py-2 space-y-3">
          {LESSON_SECTIONS.map(({ key, label }) => (
            <div key={key} className="group/section">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-stone-700 uppercase tracking-wide font-semibold">
                  {label}
                </label>
                {onImproveSection && lesson.content[key] && (
                  <AiImproveButton
                    onSubmit={(fb) => onImproveSection(lesson, key, fb)}
                  />
                )}
              </div>
              <div className="text-sm text-stone-800">
                <CollapsibleMarkdown
                  content={lesson.content[key] || ""}
                  onChange={(val) => handleSectionChange(key, val)}
                  defaultExpanded={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
