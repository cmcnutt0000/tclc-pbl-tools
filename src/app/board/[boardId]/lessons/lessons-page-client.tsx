"use client";

import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import type {
  BoardContent,
  BoardContext,
  LessonPlan,
  LessonPlanContent,
} from "@/types/board";
import LessonPlanCard from "@/components/board/lesson-plan-card";
import LessonGenerator from "@/components/board/lesson-generator";
import CollaboratorPanel from "@/components/ai/collaborator-panel";
import type {
  CollaboratorResponse,
  ProposedChange,
} from "@/lib/ai/schemas/collaborator";

const LESSON_STARTERS = [
  {
    id: "pacing",
    icon: "\u23F1\uFE0F",
    label: "Review lesson pacing and timing",
    message:
      "Review the pacing and timing of my lesson plans. Do the activities fit within each period? Are transitions smooth? Propose specific changes to improve time management.",
  },
  {
    id: "voice",
    icon: "\uD83D\uDDE3\uFE0F",
    label: "Add more student voice and choice",
    message:
      "Look at my lessons for places where students are passively receiving information. How can I add more student voice, choice, and agency? Propose changes that shift activities toward student-driven learning.",
  },
  {
    id: "hooks",
    icon: "\uD83C\uDFA3",
    label: "Strengthen the warm-up hooks",
    message:
      "Review the warm-up / hook activities across my lessons. Are they genuinely experiential and curiosity-driven, or are they disguised lectures? Propose stronger hooks that connect to students' lives.",
  },
  {
    id: "standards",
    icon: "\uD83C\uDFAF",
    label: "Check standards alignment",
    message:
      "Check whether my lesson activities actually align with the standards listed. Are there standards that aren't being addressed by the activities? Are there activities that don't connect to any standard? Propose changes to strengthen alignment.",
  },
];

interface LessonsPageClientProps {
  boardId: string;
  boardTitle: string;
  boardContent: BoardContent;
  boardContext: BoardContext;
  initialLessons: LessonPlan[];
}

export default function LessonsPageClient({
  boardId,
  boardTitle,
  boardContent,
  boardContext,
  initialLessons,
}: LessonsPageClientProps) {
  const { user } = useUser();
  const [lessons, setLessons] = useState<LessonPlan[]>(initialLessons);
  const [lessonLoading, setLessonLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [showGenerator, setShowGenerator] = useState<string | null>(null);

  // Collaborator state
  const [collaboratorCollapsed, setCollaboratorCollapsed] = useState(false);
  const [collaboratorFullscreen, setCollaboratorFullscreen] = useState(false);
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);
  const [collaboratorResponse, setCollaboratorResponse] =
    useState<CollaboratorResponse | null>(null);

  const content = boardContent;
  const context = boardContext;
  const subjects = context.subjects || [];

  // --- Lesson handlers ---

  async function handleGenerateLessons(
    agendaEntryId: string,
    sessionIndex: number,
    selections: Array<{ subject: string; periodMinutes: number }>,
  ) {
    setLessonLoading((prev) => ({ ...prev, [agendaEntryId]: true }));
    setShowGenerator(null);

    const agendaEntry = content.agenda[sessionIndex];
    if (!agendaEntry) {
      setLessonLoading((prev) => ({ ...prev, [agendaEntryId]: false }));
      return;
    }

    try {
      for (const { subject, periodMinutes } of selections) {
        const aiRes = await fetch("/api/ai/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            context,
            agendaEntry,
            sessionIndex,
            subject,
            periodMinutes,
          }),
        });
        const resText = await aiRes.text();
        if (!aiRes.ok) {
          console.error(
            "Lesson generation HTTP error for " + subject + ":",
            aiRes.status,
            resText,
          );
          alert(
            "Lesson generation failed for " +
              subject +
              ": " +
              (resText || aiRes.statusText),
          );
          continue;
        }
        if (!resText) {
          console.error(
            "Lesson generation returned empty response for " + subject,
          );
          alert(
            "Lesson generation failed for " +
              subject +
              ": empty response from server",
          );
          continue;
        }
        let aiData: any;
        try {
          aiData = JSON.parse(resText);
        } catch {
          console.error(
            "Lesson generation returned invalid JSON for " + subject + ":",
            resText.slice(0, 500),
          );
          alert(
            "Lesson generation failed for " +
              subject +
              ": invalid response from server",
          );
          continue;
        }
        if (aiData.error) {
          console.error(
            "Lesson generation error for " + subject + ":",
            aiData.error,
          );
          alert(
            "Lesson generation failed for " +
              subject +
              ": " +
              (typeof aiData.error === "string"
                ? aiData.error
                : JSON.stringify(aiData.error)),
          );
          continue;
        }

        const saveRes = await fetch("/api/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boardId,
            agendaEntryId,
            subject,
            periodMinutes,
            content: aiData,
          }),
        });
        const saveText = await saveRes.text();
        if (!saveRes.ok || !saveText) {
          console.error(
            "Lesson save failed for " + subject + ":",
            saveRes.status,
            saveText,
          );
          continue;
        }
        const saved = JSON.parse(saveText);
        if (!saved.error) {
          setLessons((prev) => [...prev, saved]);
        }
      }
    } catch (err: any) {
      console.error("Lesson generation failed:", err);
      alert(
        "Lesson generation error: " +
          (err?.message || "Unknown error. Check the browser console."),
      );
    } finally {
      setLessonLoading((prev) => ({ ...prev, [agendaEntryId]: false }));
    }
  }

  async function handleUpdateLesson(
    lessonId: string,
    updatedContent: LessonPlanContent,
  ) {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, content: updatedContent } : l,
      ),
    );
    await fetch("/api/lessons/" + lessonId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: updatedContent }),
    });
  }

  async function handleDeleteLesson(lessonId: string) {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    await fetch("/api/lessons/" + lessonId, { method: "DELETE" });
  }

  async function handleRegenerateLesson(lesson: LessonPlan) {
    const sessionIndex = content.agenda.findIndex(
      (a) => a.id === lesson.agendaEntryId,
    );
    if (sessionIndex === -1) return;

    setLessonLoading((prev) => ({
      ...prev,
      [lesson.agendaEntryId]: true,
    }));

    try {
      const agendaEntry = content.agenda[sessionIndex];
      const aiRes = await fetch("/api/ai/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          context,
          agendaEntry,
          sessionIndex,
          subject: lesson.subject,
          periodMinutes: lesson.periodMinutes,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.error) {
        alert("Lesson regeneration failed. Please try again.");
        return;
      }

      const saveRes = await fetch("/api/lessons/" + lesson.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: aiData }),
      });
      const saved = await saveRes.json();
      if (!saved.error) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lesson.id ? saved : l)),
        );
      }
    } catch (err) {
      console.error("Lesson regeneration failed:", err);
      alert("Unable to regenerate lesson. Please try again.");
    } finally {
      setLessonLoading((prev) => ({
        ...prev,
        [lesson.agendaEntryId]: false,
      }));
    }
  }

  async function handleImproveLessonSection(
    lesson: LessonPlan,
    sectionKey: keyof LessonPlanContent,
    feedback: string,
  ) {
    const sectionLabel =
      {
        learningObjectives: "Learning Objectives",
        materials: "Materials Needed",
        warmUpHook: "Warm-Up / Hook",
        mainActivities: "Main Activities",
        closingExitTicket: "Closing / Exit Ticket",
        differentiationNotes: "Differentiation",
        standardsAddressed: "Standards Addressed",
      }[sectionKey] || sectionKey;

    const syntheticCell = {
      id: "lesson-" + lesson.id + "-" + sectionKey,
      label: lesson.subject + " \u2014 " + sectionLabel,
      value: lesson.content[sectionKey] || "",
    };

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId: "lessonSection",
          cell: syntheticCell,
          content,
          context,
          feedback:
            "This is a section of a lesson plan for " +
            lesson.subject +
            " (" +
            lesson.periodMinutes +
            " min period). " +
            "Improve this " +
            sectionLabel +
            " section based on teacher feedback: " +
            feedback +
            ". Keep it student-centered and inquiry-driven.",
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI improvement failed. Please try again.");
        return;
      }
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const updatedContent = {
          ...lesson.content,
          [sectionKey]: suggestions[0].text,
        };
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lesson.id ? { ...l, content: updatedContent } : l,
          ),
        );
        await fetch("/api/lessons/" + lesson.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: updatedContent }),
        });
      }
    } catch (err) {
      console.error("Lesson section improvement failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    }
  }

  // --- Collaborator handlers ---

  function applyLessonChange(cellId: string, value: string) {
    const match = cellId.match(
      /^lesson-(.+)-(learningObjectives|materials|warmUpHook|mainActivities|closingExitTicket|differentiationNotes|standardsAddressed)$/,
    );
    if (!match) return;
    const [, lessonId, sectionKey] = match;
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    const updatedContent = { ...lesson.content, [sectionKey]: value };
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, content: updatedContent } : l,
      ),
    );
    fetch("/api/lessons/" + lessonId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: updatedContent }),
    });
  }

  async function handleCollaborate(userMessage: string) {
    setCollaboratorLoading(true);
    setCollaboratorResponse(null);
    try {
      const res = await fetch("/api/ai/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          context,
          userMessage,
          lessons,
          mode: "lessons",
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("AI collaboration error:", data.error);
        alert("AI collaboration failed. Please try again.");
        return;
      }
      setCollaboratorResponse(data);
    } catch (err) {
      console.error("AI collaboration failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    } finally {
      setCollaboratorLoading(false);
    }
  }

  function handleAcceptChange(change: ProposedChange) {
    applyLessonChange(change.cellId, change.proposedValue);
  }

  function handleAcceptAllChanges(changes: ProposedChange[]) {
    for (const change of changes) {
      applyLessonChange(change.cellId, change.proposedValue);
    }
  }

  const sidebarOpen = !collaboratorCollapsed;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-brand-800 text-white shadow-md shrink-0">
        <div className="mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 hover:text-brand-200 transition-colors"
            >
              <img
                src="/images/justlighthouse.svg"
                alt=""
                className="h-12 w-12"
              />
              <span className="text-2xl font-[var(--font-display)] font-bold">
                TCLC PBL Tools
              </span>
            </a>
            <span className="text-brand-300">/</span>
            <a
              href={"/board/" + boardId}
              className="text-brand-200 hover:text-white transition-colors text-sm"
            >
              {boardTitle}
            </a>
            <span className="text-brand-300">/</span>
            <span className="text-sm font-medium">Lesson Plans</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-200">
                {user.name || user.email}
              </span>
              <a
                href="/auth/logout"
                className="text-sm text-brand-300 hover:text-white transition-colors"
              >
                Sign Out
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div
          className={
            "h-full overflow-y-auto transition-all duration-200 " +
            (collaboratorFullscreen && sidebarOpen
              ? "hidden"
              : sidebarOpen
                ? "mr-[420px]"
                : "")
          }
        >
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-stone-800">
                  Lesson Plans
                </h1>
                <p className="text-sm text-stone-500 mt-1">
                  Generate and manage detailed lesson plans for each agenda
                  session.
                </p>
              </div>
              <a
                href={"/board/" + boardId}
                className="text-sm font-medium text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-colors"
              >
                &larr; Back to Board
              </a>
            </div>

            {content.agenda.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <p className="text-lg font-medium">No agenda sessions yet</p>
                <p className="text-sm mt-2">
                  Go back to the board and create an agenda first.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {content.agenda.map((entry, i) => {
                const entryLessons = lessons.filter(
                  (l) => l.agendaEntryId === entry.id,
                );
                const isLoading = !!lessonLoading[entry.id];

                return (
                  <SessionGroup
                    key={entry.id}
                    entry={entry}
                    sessionIndex={i}
                    entryLessons={entryLessons}
                    isLoading={isLoading}
                    subjects={subjects}
                    showGenerator={showGenerator === entry.id}
                    onToggleGenerator={() =>
                      setShowGenerator(
                        showGenerator === entry.id ? null : entry.id,
                      )
                    }
                    onGenerate={(selections) =>
                      handleGenerateLessons(entry.id, i, selections)
                    }
                    onCancelGenerator={() => setShowGenerator(null)}
                    onUpdate={handleUpdateLesson}
                    onDelete={handleDeleteLesson}
                    onRegenerate={handleRegenerateLesson}
                    onImproveSection={handleImproveLessonSection}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <CollaboratorPanel
          collapsed={collaboratorCollapsed}
          onToggleCollapse={() => {
            setCollaboratorCollapsed(!collaboratorCollapsed);
            if (!collaboratorCollapsed) setCollaboratorFullscreen(false);
          }}
          fullscreen={collaboratorFullscreen}
          onToggleFullscreen={() =>
            setCollaboratorFullscreen(!collaboratorFullscreen)
          }
          onSubmit={handleCollaborate}
          loading={collaboratorLoading}
          response={collaboratorResponse}
          onAcceptChange={handleAcceptChange}
          onAcceptAll={handleAcceptAllChanges}
          starters={LESSON_STARTERS}
        />
      </div>
    </div>
  );
}

// --- Session group component ---

function SessionGroup({
  entry,
  sessionIndex,
  entryLessons,
  isLoading,
  subjects,
  showGenerator,
  onToggleGenerator,
  onGenerate,
  onCancelGenerator,
  onUpdate,
  onDelete,
  onRegenerate,
  onImproveSection,
}: {
  entry: { id: string; date: string; leads: string; eventsContent: string };
  sessionIndex: number;
  entryLessons: LessonPlan[];
  isLoading: boolean;
  subjects: string[];
  showGenerator: boolean;
  onToggleGenerator: () => void;
  onGenerate: (
    selections: Array<{ subject: string; periodMinutes: number }>,
  ) => void;
  onCancelGenerator: () => void;
  onUpdate: (lessonId: string, content: LessonPlanContent) => void;
  onDelete: (lessonId: string) => void;
  onRegenerate: (lesson: LessonPlan) => void;
  onImproveSection: (
    lesson: LessonPlan,
    sectionKey: keyof LessonPlanContent,
    feedback: string,
  ) => Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      {/* Session header */}
      <div
        className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
        style={{ backgroundColor: "#C2D5D8" }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-600 w-3">
            {collapsed ? "\u25B6" : "\u25BC"}
          </span>
          <span className="font-semibold text-stone-800">
            Session {sessionIndex + 1}
          </span>
          {entry.date && (
            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wide">
              {entry.date}
            </span>
          )}
          {entry.leads && (
            <span className="text-sm text-stone-600">{entry.leads}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {entryLessons.length > 0 && (
            <span className="text-xs text-stone-500">
              {entryLessons.length} lesson
              {entryLessons.length !== 1 ? "s" : ""}
            </span>
          )}
          {subjects.length > 0 && entry.eventsContent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleGenerator();
              }}
              disabled={isLoading}
              className={
                "text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap " +
                (isLoading
                  ? "bg-stone-200 text-stone-400"
                  : "bg-brand-800 hover:bg-brand-900 text-white")
              }
            >
              {isLoading ? "Generating..." : "+ Generate Lessons"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-5 py-4 bg-white">
          {/* Generator form */}
          {showGenerator && subjects.length > 0 && (
            <div className="mb-4">
              <LessonGenerator
                subjects={subjects}
                onGenerate={onGenerate}
                onCancel={onCancelGenerator}
                loading={isLoading}
              />
            </div>
          )}

          {/* Lessons list */}
          {entryLessons.length > 0 ? (
            <div className="space-y-3">
              {entryLessons.map((lesson) => (
                <LessonPlanCard
                  key={lesson.id}
                  lesson={lesson}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onRegenerate={onRegenerate}
                  onImproveSection={onImproveSection}
                />
              ))}
            </div>
          ) : (
            !showGenerator && (
              <p className="text-sm text-stone-400 italic py-2">
                No lessons generated for this session yet.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
