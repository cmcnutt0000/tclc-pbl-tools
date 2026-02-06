import type { BoardContent } from "@/types/board";

export function serializeBoard(content: BoardContent): string {
  const parts: string[] = [];
  const ip = content.initialPlanning;
  parts.push("=== INITIAL PLANNING ===");
  parts.push("Main Idea: " + (ip.mainIdea.value || "(empty)"));
  if (ip.standards.length > 0) {
    for (const stdCell of ip.standards) {
      parts.push(stdCell.label + ": " + (stdCell.value || "(empty)"));
    }
  } else {
    parts.push("Standards: (none configured)");
  }
  parts.push("Notice & Reflect: " + (ip.noticeReflect.value || "(empty)"));
  parts.push(
    "Community Partners: " + (ip.communityPartners?.value || "(empty)"),
  );
  parts.push("Opening Activity: " + (ip.openingActivity.value || "(empty)"));
  const dt = content.designThinking;
  parts.push("\n=== DESIGN THINKING ===");
  parts.push("Driving Question: " + (dt.drivingQuestion.value || "(empty)"));
  parts.push("Empathize: " + (dt.empathize.value || "(empty)"));
  parts.push(
    "Milestone (Empathize): " + (dt.milestoneEmpathize.value || "(empty)"),
  );
  parts.push("Define: " + (dt.define.value || "(empty)"));
  parts.push("Milestone (Define): " + (dt.milestoneDefine.value || "(empty)"));
  parts.push("Ideate: " + (dt.ideate.value || "(empty)"));
  parts.push("Milestone (Ideate): " + (dt.milestoneIdeate.value || "(empty)"));
  parts.push("Prototype & Test: " + (dt.prototypeTest.value || "(empty)"));
  parts.push(
    "Milestone (Prototype & Test): " +
      (dt.milestonePrototypeTest.value || "(empty)"),
  );
  if (content.agenda.length > 0) {
    parts.push("\n=== AGENDA ===");
    content.agenda.forEach((entry, i) => {
      parts.push(
        "Session " + (i + 1) + ": " + (entry.eventsContent || "(empty)"),
      );
    });
  }
  return parts.join("\n");
}

export function buildHqpblPrompt(content: BoardContent): string {
  const lines: string[] = [];
  lines.push(
    "Evaluate this PBL Design Board against the HQPBL framework, Design Thinking methodology, and Deeper Learning competencies.",
  );
  lines.push("");
  lines.push(serializeBoard(content));
  lines.push("");
  lines.push("Rate each of the 6 HQPBL criteria:");
  lines.push("1. Intellectual Challenge & Accomplishment");
  lines.push("2. Authenticity");
  lines.push("3. Public Product");
  lines.push("4. Collaboration");
  lines.push("5. Project Management");
  lines.push("6. Reflection");
  lines.push("");
  lines.push("For each criterion, provide:");
  lines.push("- A rating: strong, developing, or needs_attention");
  lines.push(
    "- Specific feedback grounded in HQPBL, Design Thinking, and the pedagogical frameworks (Dewey, hooks, Freire, Doll)",
  );
  lines.push(
    "- 1-3 concrete suggestions that reference specific Deeper Learning competencies where applicable",
  );
  lines.push("- Which cells are most relevant");
  lines.push("");
  lines.push(
    "Also provide an overall summary with the most impactful next steps.",
  );
  return lines.join("\n");
}
