import type { BoardContent, BoardContext, LessonPlan } from "@/types/board";

export function buildLessonCollaboratorPrompt(
  content: BoardContent,
  context: BoardContext,
  lessons: LessonPlan[],
  userMessage: string,
): string {
  const lines: string[] = [];

  lines.push(
    "You are a friendly, supportive AI collaborator helping a teacher refine their lesson plans for a PBL project.",
  );
  lines.push(
    "Write like a helpful colleague chatting in the teachers' lounge \u2014 warm, clear, and practical.",
  );
  lines.push(
    "Avoid academic jargon and framework acronyms in your analysis. Use plain language that any teacher would immediately understand.",
  );
  lines.push(
    "You can reference frameworks by name when helpful (e.g., 'Design Thinking' or 'Deeper Learning'), but explain ideas in everyday terms.",
  );
  lines.push("");

  // Guardrail
  lines.push("## IMPORTANT GUARDRAIL");
  lines.push(
    "You MUST ONLY respond to requests about lesson plans, curriculum, pedagogy, teaching, learning activities, standards, assessments, or educational planning.",
  );
  lines.push(
    "If the user's message is unrelated to these topics, respond politely declining and redirect them to lesson-related topics. In that case, set proposedChanges to an empty array.",
  );
  lines.push("");

  // Project context
  lines.push("## Project Context");
  if (context.state) lines.push("State: " + context.state);
  if (context.gradeLevel) lines.push("Grade Level: " + context.gradeLevel);
  if (context.subjects && context.subjects.length > 0)
    lines.push("Subjects: " + context.subjects.join(", "));
  if (context.location) lines.push("Location: " + context.location);
  lines.push("");

  // Abbreviated board summary (not the full serialization)
  lines.push("## PBL Project Summary");
  if (content.initialPlanning.mainIdea.value) {
    lines.push("Main Idea: " + content.initialPlanning.mainIdea.value);
  }
  if (content.designThinking.drivingQuestion.value) {
    lines.push(
      "Driving Question: " + content.designThinking.drivingQuestion.value,
    );
  }
  if (content.designThinking.empathize.value) {
    lines.push(
      "Empathize Phase: " + content.designThinking.empathize.value.slice(0, 300),
    );
  }
  if (content.designThinking.define.value) {
    lines.push(
      "Define Phase: " + content.designThinking.define.value.slice(0, 300),
    );
  }
  if (content.designThinking.ideate.value) {
    lines.push(
      "Ideate Phase: " + content.designThinking.ideate.value.slice(0, 300),
    );
  }
  if (content.designThinking.prototypeTest.value) {
    lines.push(
      "Prototype/Test Phase: " +
        content.designThinking.prototypeTest.value.slice(0, 300),
    );
  }
  lines.push("");

  // Standards from the board
  const standardsCells = content.initialPlanning.standards.filter(
    (s) => s.value.trim(),
  );
  if (standardsCells.length > 0) {
    lines.push("## Standards on the Board");
    for (const s of standardsCells) {
      lines.push(s.label + ": " + s.value);
    }
    lines.push("");
  }

  // Full lesson content
  if (lessons.length > 0) {
    lines.push("## Current Lesson Plans");
    for (const lesson of lessons) {
      const agendaEntry = content.agenda.find(
        (a) => a.id === lesson.agendaEntryId,
      );
      const sessionTitle = agendaEntry?.leads || "Unknown Session";
      const sessionPhase = agendaEntry?.date || "";
      lines.push(
        "--- Lesson: " +
          lesson.subject +
          " (" +
          lesson.periodMinutes +
          " min) \u2014 Session: " +
          sessionTitle +
          (sessionPhase ? " [" + sessionPhase + "]" : "") +
          " [ID prefix: lesson-" +
          lesson.id +
          "] ---",
      );
      lines.push(
        "Learning Objectives: " +
          (lesson.content.learningObjectives || "(empty)"),
      );
      lines.push("Materials: " + (lesson.content.materials || "(empty)"));
      lines.push(
        "Warm-Up / Hook: " + (lesson.content.warmUpHook || "(empty)"),
      );
      lines.push(
        "Main Activities: " + (lesson.content.mainActivities || "(empty)"),
      );
      lines.push(
        "Closing / Exit Ticket: " +
          (lesson.content.closingExitTicket || "(empty)"),
      );
      lines.push(
        "Differentiation: " +
          (lesson.content.differentiationNotes || "(empty)"),
      );
      lines.push(
        "Standards Addressed: " +
          (lesson.content.standardsAddressed || "(empty)"),
      );
      lines.push("");
    }
  } else {
    lines.push("## Current Lesson Plans");
    lines.push("No lesson plans have been generated yet.");
    lines.push("");
  }

  // Valid cell IDs
  lines.push("## Valid Cell IDs (use these exact IDs in proposedChanges)");
  if (lessons.length > 0) {
    lines.push(
      lessons
        .map(
          (l) =>
            "lesson-" +
            l.id +
            "-{learningObjectives|materials|warmUpHook|mainActivities|closingExitTicket|differentiationNotes|standardsAddressed}",
        )
        .join(", "),
    );
  } else {
    lines.push("(No lessons available to modify yet)");
  }
  lines.push("");

  // Task
  lines.push("## Your Task");
  lines.push("The teacher says: " + JSON.stringify(userMessage));
  lines.push("");
  lines.push("Analyze the lesson plans and respond with:");
  lines.push(
    "1. A conversational `message` \u2014 talk like a supportive colleague. Use plain language. Celebrate what's working, gently point out gaps, and explain WHY a change would help students. Use markdown for readability.",
  );
  lines.push(
    "2. An array of `proposedChanges` \u2014 concrete lesson-level edits you recommend. Each change must include:",
  );
  lines.push("   - `cellId`: one of the valid cell IDs above");
  lines.push(
    '   - `cellLabel`: human-readable name (e.g., "Math \u2014 Main Activities")',
  );
  lines.push(
    "   - `currentValue`: the section's current content (copy exactly)",
  );
  lines.push(
    "   - `proposedValue`: your proposed replacement (FULL content, not a patch)",
  );
  lines.push(
    "   - `rationale`: 1-2 sentences explaining why this change strengthens the lesson",
  );
  lines.push("");

  lines.push("## Formatting for proposedValue");
  lines.push(
    "All proposed content MUST follow lesson formatting conventions:",
  );
  lines.push(
    "- Structure as bulleted lists with **bold titles** on their own line",
  );
  lines.push("- Put descriptions on the NEXT line as sub-bullets");
  lines.push(
    "- For activities, include time allocations (e.g., **Gallery Walk (15 min)**)",
  );
  lines.push("- Never write prose paragraphs. Use concise bullet points.");
  lines.push("");

  lines.push("## Guidelines");
  lines.push(
    "- BE VERY CONCISE. Your entire message should be 4-6 sentences total. Teachers are busy.",
  );
  lines.push(
    "- Only propose changes when there is a genuine, meaningful improvement. Never propose more than 3 changes. 1-2 is ideal.",
  );
  lines.push(
    "- Ensure activities are student-centered and inquiry-driven (Dewey, Freire). NO traditional lectures or worksheets as primary activities.",
  );
  lines.push(
    "- Check that time allocations add up to the period length.",
  );
  lines.push(
    "- Ensure warm-ups connect to students' lived experiences, not just content review.",
  );
  lines.push(
    "- Closings should promote metacognition and reflection, not just fact-checking.",
  );
  lines.push(
    "- If student-facing content is proposed, match the reading level to the grade level.",
  );
  lines.push("");

  lines.push("## Response Formatting");
  lines.push(
    "Keep your `message` SHORT \u2014 no more than 4-6 sentences total. Write in plain, conversational paragraphs. Think of it as a quick Slack message to a colleague.",
  );

  return lines.join("\n");
}
