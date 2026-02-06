import type { BoardContent, BoardContext } from "@/types/board";
import type { BoardVariation } from "../schemas/board-generation";
import { gatherExistingContent } from "./cell-prompts";

export function buildBoardPrompt(
  content: BoardContent,
  context: BoardContext,
  feedback?: string,
  previousVariation?: BoardVariation,
): string {
  const existing = gatherExistingContent(content);
  const hasContent = existing !== "No content yet.";
  const contextParts: string[] = [];
  if (context.state) contextParts.push("State: " + context.state);
  if (context.gradeLevel)
    contextParts.push("Grade Level: " + context.gradeLevel);
  if (context.subjects?.length)
    contextParts.push("Subjects: " + context.subjects.join(", "));
  if (context.location) contextParts.push("Location: " + context.location);
  const contextStr = contextParts.join("\n");

  const lines: string[] = [];
  if (feedback && previousVariation) {
    lines.push(
      "Generate a revised PBL project variation based on the teacher's feedback.",
    );
  } else {
    lines.push(
      "Generate one complete PBL project variation for a design board.",
    );
  }
  lines.push("");
  if (contextStr) {
    lines.push("Project Context:");
    lines.push(contextStr);
    lines.push("");
  }
  if (hasContent) {
    lines.push(
      "The teacher has already filled in some content. Use it as constraints and build upon their ideas:",
    );
    lines.push(existing);
    lines.push("");
  }
  if (feedback && previousVariation) {
    lines.push("Previous variation the teacher wants revised:");
    lines.push("Title: " + previousVariation.title);
    lines.push("Main Idea: " + previousVariation.mainIdea);
    lines.push("Driving Question: " + previousVariation.drivingQuestion);
    lines.push("Empathize: " + previousVariation.empathize);
    lines.push("Define: " + previousVariation.define);
    lines.push("Ideate: " + previousVariation.ideate);
    lines.push("Prototype & Test: " + previousVariation.prototypeTest);
    lines.push("");
    lines.push("Teacher's feedback: " + feedback);
    lines.push("");
    lines.push(
      "Generate a new variation that addresses this feedback while keeping what worked.",
    );
    lines.push("");
  }
  lines.push(
    "The variation should be a complete, coherent project that fills ALL cells:",
  );
  lines.push("- Main Idea / Topic");
  if (context.subjects && context.subjects.length > 0) {
    for (const subject of context.subjects) {
      lines.push("- Standards: " + subject);
    }
  } else {
    lines.push("- Standards");
  }
  lines.push("- Notice & Reflect");
  lines.push("- Community Partners");
  lines.push("- Opening Activity");
  lines.push("- Driving Question");
  lines.push("- Empathize");
  lines.push("- Milestone: Empathize (checkpoint after empathy phase)");
  lines.push("- Define");
  lines.push("- Milestone: Define (checkpoint after define phase)");
  lines.push("- Ideate");
  lines.push("- Milestone: Ideate (checkpoint after ideation phase)");
  lines.push("- Prototype & Test");
  lines.push(
    "- Milestone: Prototype & Test (final deliverable and presentation)",
  );
  lines.push("");
  lines.push("The project should meet HQPBL standards.");
  if (context.gradeLevel) {
    lines.push("");
    lines.push(
      "IMPORTANT: Student-facing content (driving question, milestones, activity descriptions) must be written at a Grade " +
        context.gradeLevel +
        " reading level. Match vocabulary and complexity to that age group. Teacher-facing content like standards can use professional language.",
    );
  }
  lines.push("");
  lines.push(
    "Format ALL cell content as bulleted lists. Each key point gets a **bold title** on its own line, with the description as a sub-bullet on the NEXT line (not on the same line as the title). Use further sub-bullets for details. No prose paragraphs — scannable bullet lists only.",
  );
  return lines.join("\n");
}
