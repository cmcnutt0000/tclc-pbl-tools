"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import type {
  BoardContent,
  BoardContext,
  CellContent,
  LessonPlan,
  LessonPlanContent,
} from "@/types/board";
import {
  syncStandardsCells,
  createStandardsCell,
  createEmptyAgendaEntry,
} from "@/types/board";
import DesignBoard from "@/components/board/design-board";
import ContextModal from "@/components/context-modal";
import SuggestionPanel from "@/components/ai/suggestion-panel";
import BoardVariationPanel from "@/components/ai/board-variation-panel";
import CollaboratorPanel from "@/components/ai/collaborator-panel";
import type {
  CollaboratorResponse,
  ProposedChange,
} from "@/lib/ai/schemas/collaborator";

interface BoardPageClientProps {
  boardId: string;
  initialTitle: string;
  initialContent: BoardContent;
  initialContext: BoardContext;
}

export default function BoardPageClient({
  boardId,
  initialTitle,
  initialContent,
  initialContext,
}: BoardPageClientProps) {
  const { user } = useUser();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<BoardContent>(initialContent);
  const [context, setContext] = useState<BoardContext>(initialContext);

  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [activeCellLabel, setActiveCellLabel] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ text: string; rationale: string }>
  >([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [variationLoading, setVariationLoading] = useState(false);
  const [showGeneratedBanner, setShowGeneratedBanner] = useState(false);

  const [collaboratorCollapsed, setCollaboratorCollapsed] = useState(false);
  const [collaboratorFullscreen, setCollaboratorFullscreen] = useState(false);
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);
  const [collaboratorResponse, setCollaboratorResponse] =
    useState<CollaboratorResponse | null>(null);

  const [agendaLoading, setAgendaLoading] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);

  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [lessonLoading, setLessonLoading] = useState<Record<string, boolean>>(
    {},
  );

  // Undo/redo history
  const historyRef = useRef<{
    past: BoardContent[];
    future: BoardContent[];
  }>({ past: [], future: [] });
  const lastHistoryPush = useRef<number>(0);
  const MAX_HISTORY = 50;

  const contextComplete = !!(
    context.state &&
    context.gradeLevel &&
    context.subjects &&
    context.subjects.length > 0
  );

  const filledCellCount = [
    content.initialPlanning.mainIdea.value,
    ...content.initialPlanning.standards.map((s) => s.value),
    content.initialPlanning.noticeReflect.value,
    content.initialPlanning.communityPartners.value,
    content.initialPlanning.openingActivity.value,
    content.designThinking.drivingQuestion.value,
    content.designThinking.empathize.value,
    content.designThinking.define.value,
    content.designThinking.ideate.value,
    content.designThinking.prototypeTest.value,
  ].filter((v) => v.trim().length > 0).length;

  // Board is complete when all main cells + milestones are filled
  const boardComplete =
    filledCellCount >= 5 &&
    !!content.designThinking.drivingQuestion.value.trim() &&
    !!content.designThinking.empathize.value.trim() &&
    !!content.designThinking.milestoneEmpathize.value.trim() &&
    !!content.designThinking.define.value.trim() &&
    !!content.designThinking.milestoneDefine.value.trim() &&
    !!content.designThinking.ideate.value.trim() &&
    !!content.designThinking.milestoneIdeate.value.trim() &&
    !!content.designThinking.prototypeTest.value.trim() &&
    !!content.designThinking.milestonePrototypeTest.value.trim();

  const saveTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const save = useCallback(
    async (nc?: BoardContent, nctx?: BoardContext, nt?: string) => {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        await fetch("/api/boards/" + boardId, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: nt ?? title,
            content: nc ?? content,
            state: (nctx ?? context).state,
            gradeLevel: (nctx ?? context).gradeLevel,
            subjects: (nctx ?? context).subjects,
            location: (nctx ?? context).location,
          }),
        });
      }, 1000);
    },
    [boardId, title, content, context],
  );

  function handleContentChange(nc: BoardContent) {
    const now = Date.now();
    // Only push to history if >1s since last push (debounce for typing)
    if (now - lastHistoryPush.current > 1000) {
      historyRef.current.past.push(content);
      if (historyRef.current.past.length > MAX_HISTORY) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
      lastHistoryPush.current = now;
    }
    setContent(nc);
    save(nc);
  }

  // Use ref to always access latest content in undo/redo without stale closures
  const contentRef = useRef(content);
  contentRef.current = content;

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return;
    const prev = past.pop()!;
    future.push(contentRef.current);
    setContent(prev);
    save(prev);
  }, [save]);

  const redo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;
    const next = future.pop()!;
    past.push(contentRef.current);
    setContent(next);
    save(next);
  }, [save]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (key === "y" || (key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Load lessons on mount
  useEffect(() => {
    async function loadLessons() {
      try {
        const res = await fetch("/api/lessons?boardId=" + boardId);
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        }
      } catch (err) {
        console.error("Failed to load lessons:", err);
      }
    }
    loadLessons();
  }, [boardId]);

  function handleContextChange(nctx: BoardContext) {
    setContext(nctx);
    const newSubjects = nctx.subjects || [];
    const syncedStandards = syncStandardsCells(
      content.initialPlanning.standards,
      newSubjects,
    );
    const nc = {
      ...content,
      initialPlanning: {
        ...content.initialPlanning,
        standards: syncedStandards,
      },
    };
    setContent(nc);
    save(nc, nctx);
  }
  function handleTitleChange(nt: string) {
    setTitle(nt);
    save(undefined, undefined, nt);
  }

  async function handleAiCellClick(cellId: string, cell: CellContent) {
    setActiveCellId(cellId);
    setActiveCellLabel(cell.label);
    setSuggestions([]);
    setSuggestionsLoading(true);
    setShowSuggestions(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellId, cell, content, context }),
      });
      const data = await res.json();
      if (data.error) {
        setSuggestions([
          {
            text: "AI generation failed. Please check your API key and try again.",
            rationale: String(data.error),
          },
        ]);
      } else {
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      setSuggestions([
        {
          text: "Unable to reach the AI service. Please try again.",
          rationale: "",
        },
      ]);
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function handleSelectSuggestion(text: string) {
    if (!activeCellId) return;
    handleContentChange(updateCellValue(content, activeCellId, text));
    setShowSuggestions(false);
  }
  async function handleGenerateTitle() {
    setTitleLoading(true);
    try {
      const mainIdea = content.initialPlanning.mainIdea.value;
      const subjects = (context.subjects || []).join(", ");
      const grade = context.gradeLevel || "";
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId: "boardTitle",
          cell: {
            id: "boardTitle",
            label: "Board Title",
            value: title,
          },
          content,
          context,
          feedback:
            "Generate a short, creative, engaging project title (3-8 words) for a PBL board. " +
            "The main idea is: " +
            mainIdea +
            ". " +
            (subjects ? "Subjects: " + subjects + ". " : "") +
            (grade ? "Grade level: " + grade + ". " : "") +
            "Return ONLY the title text, no formatting, no quotes, no explanation.",
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI title generation failed. Please try again.");
        return;
      }
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const newTitle = suggestions[0].text.replace(/^["']|["']$/g, "").trim();
        setTitle(newTitle);
        save(undefined, undefined, newTitle);
      }
    } catch {
      alert("Unable to reach the AI service. Please try again.");
    } finally {
      setTitleLoading(false);
    }
  }

  async function handleGenerateBoard() {
    setVariationLoading(true);
    setShowGeneratedBanner(false);
    try {
      const res = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, context }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Board generation error:", data.error);
        alert(
          "AI board generation failed. Please check your API key and try again.",
        );
        return;
      }
      handleSelectVariation(data.variation);
      setShowGeneratedBanner(true);
    } catch (err) {
      console.error("Board generation failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    } finally {
      setVariationLoading(false);
    }
  }

  function handleSelectVariation(v: any) {
    const nc = { ...content };
    // Map AI standards (array of {subject, content}) to standards cells
    const subjects = context.subjects || [];
    let newStandards: typeof nc.initialPlanning.standards;
    if (Array.isArray(v.standards)) {
      // New format: [{subject, content}]
      newStandards = subjects.map((subject) => {
        const existing =
          nc.initialPlanning.standards.find(
            (s) => s.label === "Standards: " + subject,
          ) || createStandardsCell(subject);
        const match = v.standards.find((s: any) => s.subject === subject);
        return { ...existing, value: match?.content || "" };
      });
    } else {
      // Fallback: single string
      newStandards = nc.initialPlanning.standards.map((s, i) =>
        i === 0 ? { ...s, value: v.standards || "" } : s,
      );
    }
    nc.initialPlanning = {
      ...nc.initialPlanning,
      mainIdea: { ...nc.initialPlanning.mainIdea, value: v.mainIdea || "" },
      standards: newStandards,
      noticeReflect: {
        ...nc.initialPlanning.noticeReflect,
        value: v.noticeReflect || "",
      },
      communityPartners: {
        ...nc.initialPlanning.communityPartners,
        value: v.communityPartners || "",
      },
      openingActivity: {
        ...nc.initialPlanning.openingActivity,
        value: v.openingActivity || "",
      },
    };
    nc.designThinking = {
      ...nc.designThinking,
      drivingQuestion: {
        ...nc.designThinking.drivingQuestion,
        value: v.drivingQuestion || "",
      },
      empathize: { ...nc.designThinking.empathize, value: v.empathize || "" },
      milestoneEmpathize: {
        ...nc.designThinking.milestoneEmpathize,
        value: v.milestoneEmpathize || "",
      },
      define: { ...nc.designThinking.define, value: v.define || "" },
      milestoneDefine: {
        ...nc.designThinking.milestoneDefine,
        value: v.milestoneDefine || "",
      },
      ideate: { ...nc.designThinking.ideate, value: v.ideate || "" },
      milestoneIdeate: {
        ...nc.designThinking.milestoneIdeate,
        value: v.milestoneIdeate || "",
      },
      prototypeTest: {
        ...nc.designThinking.prototypeTest,
        value: v.prototypeTest || "",
      },
      milestonePrototypeTest: {
        ...nc.designThinking.milestonePrototypeTest,
        value: v.milestonePrototypeTest || "",
      },
    };
    handleContentChange(nc);
  }

  async function handleFixWithAi(
    cellId: string,
    cell: CellContent,
    feedback: string,
  ) {
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellId, cell, content, context, feedback }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI fix failed. Please try again.");
        return;
      }
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        handleContentChange(
          updateCellValue(content, cellId, suggestions[0].text),
        );
      }
    } catch (err) {
      console.error("Fix with AI failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    }
  }

  async function handleAddWithAi(
    cellId: string,
    cell: CellContent,
    description: string,
  ) {
    const addFeedback =
      "Add a NEW section to this cell about: " +
      description +
      ". Generate ONLY the new section content (one bold-header section with sub-bullets). Do NOT repeat any existing content.";
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId,
          cell,
          content,
          context,
          feedback: addFeedback,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI add failed. Please try again.");
        return;
      }
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const currentValue = getCellValue(content, cellId);
        const newValue = currentValue.trim()
          ? currentValue.trimEnd() + "\n" + suggestions[0].text
          : suggestions[0].text;
        handleContentChange(updateCellValue(content, cellId, newValue));
      }
    } catch (err) {
      console.error("Add with AI failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    }
  }

  async function handleCollaborate(userMessage: string) {
    setCollaboratorLoading(true);
    setCollaboratorResponse(null);
    try {
      const res = await fetch("/api/ai/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, context, userMessage, lessons }),
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

  function applyLessonChange(cellId: string, value: string) {
    // cellId format: lesson-{lessonId}-{sectionKey}
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

  function handleAcceptChange(change: ProposedChange) {
    if (change.cellId.startsWith("lesson-")) {
      applyLessonChange(change.cellId, change.proposedValue);
    } else {
      handleContentChange(
        updateCellValue(content, change.cellId, change.proposedValue),
      );
    }
  }

  function handleAcceptAllChanges(changes: ProposedChange[]) {
    let nc = content;
    for (const change of changes) {
      if (change.cellId.startsWith("lesson-")) {
        applyLessonChange(change.cellId, change.proposedValue);
      } else {
        nc = updateCellValue(nc, change.cellId, change.proposedValue);
      }
    }
    handleContentChange(nc);
  }

  async function handleFixWithAiAgenda(
    entryIndex: number,
    field: string,
    feedback: string,
  ) {
    const entry = content.agenda[entryIndex];
    if (!entry) return;
    const currentValue = (entry as any)[field] || "";
    const cellId =
      field === "reflection" ? "agendaReflection" : "agendaEventsContent";
    const syntheticCell = {
      id: "agenda-" + field + "-" + entryIndex,
      label:
        field === "reflection" ? "Session Reflection" : "Session Activities",
      value: currentValue,
    };
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId,
          cell: syntheticCell,
          content,
          context,
          feedback,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI improvement failed. Please try again.");
        return;
      }
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const updated = [...content.agenda];
        updated[entryIndex] = {
          ...updated[entryIndex],
          [field]: suggestions[0].text,
        };
        handleContentChange({ ...content, agenda: updated });
      }
    } catch (err) {
      console.error("Agenda AI fix failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    }
  }

  function handleCrossCellDrop(
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex?: number,
  ) {
    // Get current values for source and target cells
    const sourceValue = getCellValue(content, sourceCellId);
    const targetValue = getCellValue(content, targetCellId);

    // Remove the dragged section from source by reconstructing without those rawLines
    const sectionText = rawLines.join("\n");
    const newSourceValue = sourceValue
      .replace(sectionText, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Insert into target at the specified position
    let newTargetValue: string;
    if (dropIndex !== undefined && targetValue) {
      // Parse target sections to insert at the right position
      const targetSections = parseSectionsForInsert(targetValue);
      if (targetSections && dropIndex <= targetSections.length) {
        targetSections.splice(dropIndex, 0, sectionText);
        newTargetValue = targetSections.join("\n");
      } else {
        newTargetValue = targetValue.trim() + "\n" + sectionText;
      }
    } else {
      newTargetValue = targetValue
        ? targetValue.trim() + "\n" + sectionText
        : sectionText;
    }

    // Update both cells in one content change
    let nc = updateCellValue(content, sourceCellId, newSourceValue);
    nc = updateCellValue(nc, targetCellId, newTargetValue);
    handleContentChange(nc);
  }

  async function handleGenerateAgenda(numDays: number) {
    setAgendaLoading(true);
    try {
      const res = await fetch("/api/ai/generate-agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, context, numDays }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Agenda generation error:", data.error);
        alert(
          "AI agenda generation failed. Please check your API key and try again.",
        );
        return;
      }
      const sessions = (data.sessions || []).map((s: any) => {
        const entry = createEmptyAgendaEntry();
        entry.date = s.designPhase || "";
        entry.leads = s.title || "";
        entry.eventsContent = s.eventsContent || "";
        entry.reflection = s.reflection || "";
        return entry;
      });
      if (sessions.length > 0) {
        handleContentChange({ ...content, agenda: sessions });
      }
    } catch (err) {
      console.error("Agenda generation failed:", err);
      alert("Unable to reach the AI service. Please try again.");
    } finally {
      setAgendaLoading(false);
    }
  }

  async function handleGenerateLessons(
    agendaEntryId: string,
    sessionIndex: number,
    selections: Array<{ subject: string; periodMinutes: number }>,
  ) {
    setLessonLoading((prev) => ({ ...prev, [agendaEntryId]: true }));

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
        const aiData = await aiRes.json();
        if (aiData.error) {
          console.error(
            "Lesson generation error for " + subject + ":",
            aiData.error,
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
        const saved = await saveRes.json();
        if (!saved.error) {
          setLessons((prev) => [...prev, saved]);
        }
      }
    } catch (err) {
      console.error("Lesson generation failed:", err);
      alert("Unable to generate lessons. Please try again.");
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
        setLessons((prev) => prev.map((l) => (l.id === lesson.id ? saved : l)));
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
      label: lesson.subject + " — " + sectionLabel,
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

  const sidebarOpen = !collaboratorCollapsed;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-brand-800 text-white shadow-md shrink-0">
        <div className="mx-auto px-6 py-2 flex items-center justify-between">
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
        {/* Main board area */}
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
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <ContextModal context={context} onChange={handleContextChange} />
          </div>
          {showGeneratedBanner && (
            <div className="max-w-7xl mx-auto px-4 pt-4">
              <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-brand-800">
                  Is this what you were thinking? Edit any section below, or use{" "}
                  <strong>Improve with AI</strong> on individual cells to refine
                  them.
                </p>
                <button
                  onClick={() => setShowGeneratedBanner(false)}
                  className="text-brand-400 hover:text-brand-600 ml-4"
                >
                  &#x2715;
                </button>
              </div>
            </div>
          )}
          <DesignBoard
            content={content}
            context={context}
            onChange={handleContentChange}
            onAiCellClick={handleAiCellClick}
            onFixWithAi={handleFixWithAi}
            onAddWithAi={handleAddWithAi}
            onCrossCellDrop={handleCrossCellDrop}
            onFixWithAiAgenda={handleFixWithAiAgenda}
            onGenerateBoard={handleGenerateBoard}
            onGenerateTitle={handleGenerateTitle}
            titleLoading={titleLoading}
            onGenerateAgenda={handleGenerateAgenda}
            agendaLoading={agendaLoading}
            boardComplete={boardComplete}
            boardTitle={title}
            onTitleChange={handleTitleChange}
            disabled={!contextComplete}
            canGenerateBoard={filledCellCount >= 2}
            canGenerateTitle={!!content.initialPlanning.mainIdea.value.trim()}
            lessons={lessons}
            onGenerateLessons={handleGenerateLessons}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onRegenerateLesson={handleRegenerateLesson}
            onImproveLessonSection={handleImproveLessonSection}
            lessonLoading={lessonLoading}
          />
        </div>

        {/* Collaborator sidebar — always rendered */}
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
        />
      </div>

      {/* Overlays (modals) */}
      {showSuggestions && (
        <SuggestionPanel
          cellLabel={activeCellLabel}
          suggestions={suggestions}
          loading={suggestionsLoading}
          onSelect={handleSelectSuggestion}
          onDismiss={() => setShowSuggestions(false)}
        />
      )}
      <BoardVariationPanel
        loading={variationLoading}
        onDismiss={() => setVariationLoading(false)}
      />
      <AgendaLoadingPanel
        loading={agendaLoading}
        onDismiss={() => setAgendaLoading(false)}
      />
    </div>
  );
}

const AGENDA_LOADING_MESSAGES = [
  "Mapping out the learning journey...",
  "Spacing out the design thinking phases...",
  "Balancing activities across school days...",
  "Building in reflection time...",
  "Making sure milestones land at the right moments...",
  "Designing each session for maximum engagement...",
  "Almost there — finalizing the schedule...",
];

function AgendaLoadingPanel({
  loading,
  onDismiss,
}: {
  loading: boolean;
  onDismiss: () => void;
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % AGENDA_LOADING_MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="border-b border-stone-200 px-5 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 text-lg">
            Planning Your Agenda
          </h3>
          <button
            onClick={onDismiss}
            className="text-stone-400 hover:text-stone-600 text-lg"
          >
            &#x2715;
          </button>
        </div>
        <div className="text-center py-16 px-6">
          <div className="inline-block w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-stone-700 mt-4">
            {AGENDA_LOADING_MESSAGES[msgIndex]}
          </p>
          <p className="text-sm text-stone-400 mt-2">
            This can take a minute — we're mapping your design board into daily
            sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Splits markdown content into raw section strings for positional insertion */
function parseSectionsForInsert(content: string): string[] | null {
  const lines = content.split("\n");
  const sections: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isBulletHeader = /^[-*]\s+\*\*[^*]+\*\*/.test(trimmed);
    const isStandaloneHeader =
      /^\*\*[^*]+\*\*/.test(trimmed) && !trimmed.startsWith("**Note");

    if (isBulletHeader || isStandaloneHeader) {
      if (current.length > 0) {
        sections.push(current);
      }
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    sections.push(current);
  }
  if (sections.length === 0) return null;
  return sections.map((s) => s.join("\n"));
}

function getCellValue(content: BoardContent, cellId: string): string {
  const ipKeys = [
    "mainIdea",
    "noticeReflect",
    "communityPartners",
    "openingActivity",
  ] as const;
  for (const key of ipKeys) {
    if (key === cellId) return content.initialPlanning[key].value;
  }
  if (cellId.startsWith("standards-")) {
    const subject = cellId.substring("standards-".length);
    const cell = content.initialPlanning.standards.find(
      (s) => s.label === "Standards: " + subject,
    );
    return cell?.value || "";
  }
  if (cellId.startsWith("additional-")) {
    const idx = parseInt(cellId.split("-")[1]);
    return content.initialPlanning.additional[idx]?.value || "";
  }
  if (cellId.startsWith("dt-additional-")) {
    const idx = parseInt(cellId.split("-")[2]);
    return (content.designThinking.additional || [])[idx]?.value || "";
  }
  const dtKeys = [
    "drivingQuestion",
    "empathize",
    "milestoneEmpathize",
    "define",
    "milestoneDefine",
    "ideate",
    "milestoneIdeate",
    "prototypeTest",
    "milestonePrototypeTest",
  ] as const;
  for (const key of dtKeys) {
    if (key === cellId)
      return (content.designThinking[key] as { value: string }).value;
  }
  return "";
}

function updateCellValue(
  content: BoardContent,
  cellId: string,
  value: string,
): BoardContent {
  const nc = { ...content };
  const ipKeys = [
    "mainIdea",
    "noticeReflect",
    "communityPartners",
    "openingActivity",
  ] as const;
  for (const key of ipKeys) {
    if (key === cellId) {
      nc.initialPlanning = {
        ...nc.initialPlanning,
        [key]: { ...nc.initialPlanning[key], value },
      };
      return nc;
    }
  }
  if (cellId.startsWith("standards-")) {
    const subject = cellId.substring("standards-".length);
    const updatedStandards = nc.initialPlanning.standards.map((s) =>
      s.label === "Standards: " + subject ? { ...s, value } : s,
    );
    nc.initialPlanning = { ...nc.initialPlanning, standards: updatedStandards };
    return nc;
  }
  if (cellId.startsWith("additional-")) {
    const idx = parseInt(cellId.split("-")[1]);
    const additional = [...nc.initialPlanning.additional];
    additional[idx] = { ...additional[idx], value };
    nc.initialPlanning = { ...nc.initialPlanning, additional };
    return nc;
  }
  if (cellId.startsWith("dt-additional-")) {
    const idx = parseInt(cellId.split("-")[2]);
    const additional = [...(nc.designThinking.additional || [])];
    additional[idx] = { ...additional[idx], value };
    nc.designThinking = { ...nc.designThinking, additional };
    return nc;
  }
  const dtKeys = [
    "drivingQuestion",
    "empathize",
    "milestoneEmpathize",
    "define",
    "milestoneDefine",
    "ideate",
    "milestoneIdeate",
    "prototypeTest",
    "milestonePrototypeTest",
  ] as const;
  for (const key of dtKeys) {
    if (key === cellId) {
      nc.designThinking = {
        ...nc.designThinking,
        [key]: { ...nc.designThinking[key], value },
      };
      return nc;
    }
  }
  return nc;
}
