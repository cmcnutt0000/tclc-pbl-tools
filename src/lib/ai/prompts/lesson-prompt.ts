import type { BoardContent, BoardContext, AgendaEntry } from "@/types/board";
import { gatherExistingContent } from "./cell-prompts";

export function buildLessonPrompt(
  content: BoardContent,
  context: BoardContext,
  agendaEntry: AgendaEntry,
  sessionIndex: number,
  subject: string,
  periodMinutes: number,
): string {
  const existing = gatherExistingContent(content);
  const contextParts: string[] = [];
  if (context.state) contextParts.push("State: " + context.state);
  if (context.gradeLevel)
    contextParts.push("Grade Level: " + context.gradeLevel);
  if (context.subjects?.length)
    contextParts.push("Subjects: " + context.subjects.join(", "));
  if (context.location) contextParts.push("Location: " + context.location);
  const contextStr = contextParts.join("\n");

  const standardsCell = content.initialPlanning.standards.find(
    (s) => s.label === "Standards: " + subject,
  );
  const subjectStandards = standardsCell?.value || "(no standards specified)";

  const lines: string[] = [];

  lines.push(
    "Generate a detailed lesson plan for a SINGLE class period in " +
      subject +
      ".",
  );
  lines.push("The period is " + periodMinutes + " minutes long.");
  lines.push("");

  lines.push(
    "This lesson is for Session " +
      (sessionIndex + 1) +
      " of a PBL project.",
  );
  if (agendaEntry.date) {
    lines.push("Design Thinking Phase: " + agendaEntry.date);
  }
  if (agendaEntry.leads) {
    lines.push("Session Title: " + agendaEntry.leads);
  }
  lines.push("");

  lines.push("Session Activities (from the agenda):");
  lines.push(agendaEntry.eventsContent || "(no activities specified)");
  lines.push("");

  if (agendaEntry.reflection) {
    lines.push("Session Reflection Focus:");
    lines.push(agendaEntry.reflection);
    lines.push("");
  }

  if (contextStr) {
    lines.push("Project Context:");
    lines.push(contextStr);
    lines.push("");
  }

  lines.push(subject + " Standards on this board:");
  lines.push(subjectStandards);
  lines.push("");

  lines.push("Full PBL Board Content (for context):");
  lines.push(existing);
  lines.push("");

  lines.push("CRITICAL DESIGN REQUIREMENTS:");
  lines.push(
    "- This lesson must advance the PBL project. It is NOT a standalone " +
      "lesson — it is one period within a larger project arc.",
  );
  lines.push(
    "- Activities must be student-centered and inquiry-driven (Dewey, " +
      "Freire). NO traditional lectures or worksheets as primary activities.",
  );
  lines.push(
    "- Build in student voice and choice (hooks). Students should make " +
      "meaningful decisions about their learning.",
  );
  lines.push(
    "- Include structured collaboration — productive teamwork, not just " +
      "'work in groups' (HQPBL Collaboration criterion).",
  );
  lines.push(
    "- The warm-up/hook must connect to students' lived experiences and " +
      "activate prior knowledge through doing, not listening.",
  );
  lines.push(
    "- The closing/exit ticket should promote metacognition and reflection " +
      "(Freire's praxis — the cycle of action and reflection).",
  );
  lines.push(
    "- Differentiation must provide multiple entry points and honor " +
      "diverse ways of knowing (hooks' engaged pedagogy).",
  );
  lines.push(
    "- Time allocations in mainActivities MUST add up to approximately " +
      periodMinutes +
      " minutes total (including warm-up and closing).",
  );
  lines.push("");

  if (context.gradeLevel) {
    lines.push(
      "IMPORTANT: Student-facing content (activities, objectives) must be " +
        "written at a Grade " +
        context.gradeLevel +
        " reading level.",
    );
    lines.push("");
  }

  lines.push(
    "Format ALL content as bulleted markdown lists. Each key point gets a " +
      "**bold title** on its own line, with the description as a sub-bullet " +
      "on the NEXT line. No prose paragraphs.",
  );

  return lines.join("\n");
}
