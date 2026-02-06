import type { BoardContent, BoardContext } from "@/types/board";
import { gatherExistingContent } from "./cell-prompts";

export function buildAgendaPrompt(
  content: BoardContent,
  context: BoardContext,
  numDays: number,
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

  const lines: string[] = [];
  lines.push(
    "Map this PBL Design Board into a " +
      numDays +
      "-day agenda. Each day is one school session.",
  );
  lines.push("");
  if (contextStr) {
    lines.push("Project Context:");
    lines.push(contextStr);
    lines.push("");
  }
  lines.push("Full Board Content:");
  lines.push(existing);
  lines.push("");
  lines.push("Create exactly " + numDays + " sessions that follow this flow:");
  lines.push(
    "1. **Day 1**: Opening Activity + Notice & Reflect — hook students and surface prior knowledge",
  );
  lines.push(
    "2. **Empathize phase**: Activities from the Empathize cell, ending with the Empathize milestone",
  );
  lines.push(
    "3. **Define phase**: Activities from the Define cell, ending with the Define milestone",
  );
  lines.push(
    "4. **Ideate phase**: Activities from the Ideate cell, ending with the Ideate milestone",
  );
  lines.push(
    "5. **Prototype & Test phase**: Activities from the Prototype & Test cell, ending with the final milestone/presentation",
  );
  lines.push("");
  lines.push(
    "Distribute these phases across " +
      numDays +
      " days proportionally. Milestones should land at natural breakpoints.",
  );
  lines.push(
    "Each session should have a clear title, detailed activities (from the board content), the design phase it maps to, and a reflection prompt.",
  );
  lines.push("");
  lines.push(
    "Format eventsContent as bulleted lists. Each key point gets a **bold title** on its own line, with the description as a sub-bullet on the NEXT line (not on the same line as the title). Keep each session focused and realistic for one class period.",
  );
  return lines.join("\n");
}
