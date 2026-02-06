import type { BoardContent, BoardContext, CellContent } from "@/types/board";

export function gatherExistingContent(content: BoardContent): string {
  const parts: string[] = [];
  const ip = content.initialPlanning;
  if (ip.mainIdea.value) parts.push("Main Idea: " + ip.mainIdea.value);
  for (const stdCell of ip.standards) {
    if (stdCell.value) parts.push(stdCell.label + ": " + stdCell.value);
  }
  if (ip.noticeReflect.value)
    parts.push("Notice & Reflect: " + ip.noticeReflect.value);
  if (ip.communityPartners?.value)
    parts.push("Community Partners: " + ip.communityPartners.value);
  if (ip.openingActivity.value)
    parts.push("Opening Activity: " + ip.openingActivity.value);
  const dt = content.designThinking;
  if (dt.drivingQuestion.value)
    parts.push("Driving Question: " + dt.drivingQuestion.value);
  if (dt.empathize.value) parts.push("Empathize: " + dt.empathize.value);
  if (dt.milestoneEmpathize.value)
    parts.push("Milestone (Empathize): " + dt.milestoneEmpathize.value);
  if (dt.define.value) parts.push("Define: " + dt.define.value);
  if (dt.milestoneDefine.value)
    parts.push("Milestone (Define): " + dt.milestoneDefine.value);
  if (dt.ideate.value) parts.push("Ideate: " + dt.ideate.value);
  if (dt.milestoneIdeate.value)
    parts.push("Milestone (Ideate): " + dt.milestoneIdeate.value);
  if (dt.prototypeTest.value)
    parts.push("Prototype & Test: " + dt.prototypeTest.value);
  if (dt.milestonePrototypeTest.value)
    parts.push(
      "Milestone (Prototype & Test): " + dt.milestonePrototypeTest.value,
    );
  return parts.length > 0 ? parts.join("\n") : "No content yet.";
}

// Student-facing cells — these must be written at the grade level from context
const STUDENT_FACING_CELLS = new Set([
  "drivingQuestion",
  "empathize",
  "milestoneEmpathize",
  "define",
  "milestoneDefine",
  "ideate",
  "milestoneIdeate",
  "prototypeTest",
  "milestonePrototypeTest",
  "noticeReflect",
  "openingActivity",
]);

const CELL_PROMPTS: Record<string, string> = {
  mainIdea: `Generate a main idea or topic for a PBL project. It should connect multiple subjects, matter to students' real lives, and be rich enough to sustain weeks of inquiry.`,

  standards: `Suggest relevant academic standards for this project. Include content standards and cross-cutting skills like critical thinking, collaboration, and communication. Standards should connect naturally to the project, not feel forced.`,

  noticeReflect: `Design a Notice & Reflect activity where students observe, question, and connect to the topic before diving in. This should get students actively thinking and sharing what they already know — not just listening.`,

  communityPartners: `Suggest community partners for this PBL project. Based on the project theme and location, identify specific types of local organizations, businesses, experts, or community members who could contribute. For each partner, explain how they could be involved (guest speaker, site visit, mentorship, materials, authentic audience, etc.). Be specific to the location if one is provided.`,

  openingActivity: `Create an engaging hook activity that sparks curiosity and sets up the project. It should be hands-on (not a lecture or reading), surface what students already know, and connect to their real lives.`,

  drivingQuestion: `Craft a driving question for this PBL project. A well-defined driving question has these qualities:

**Open-Ended**: It can't be answered with a simple yes/no or a quick Google search. It invites exploration, multiple approaches, and ongoing investigation.
  - Good: "How can we design a simple air filtration system using materials at home?"
  - Not: "What is the composition of air?"

**Aligned with Learning Goals**: It connects to the standards and content students need to learn, while also building problem-solving and design thinking skills.
  - Good: "How can we design a habitat that meets the needs of a specific animal in our local area?"
  - Not: "What do animals need to survive?"

**Encourages Inquiry & Engagement**: It makes students want to dig in — it's hands-on, relevant to their everyday lives, and pushes them to explore and experiment.

**Connects to Real-Life Challenges**: It addresses a real problem or issue that students can relate to in their community or world.
  - Good: "How can we travel to school in an environmentally friendly way?"
  - Not: "What types of vehicles are used for transportation?"

Write the driving question at a reading level appropriate for the grade level. Use "How can we..." or "How might we..." framing when possible.`,

  empathize: `Design activities where students understand the people affected by the problem. Students should talk to real people, visit places, or use primary sources — not just read about the issue. Think interviews, community walks, or simulations.`,

  milestoneEmpathize: `Design a checkpoint showing students understand who is affected and what they care about. Could include empathy maps, interview summaries, or reflections on what they learned from listening to others.`,

  define: `Help students narrow down the specific problem they want to solve. They should synthesize what they learned in the empathy phase into a clear problem statement — specific enough to act on, but open enough for creative solutions.`,

  milestoneDefine: `Design a checkpoint where students show they've clearly defined the problem. Could include a problem statement, a "How Might We" question, or a root cause analysis shared with peers.`,

  ideate: `Design brainstorming activities where students come up with multiple solutions. This is about quantity and creativity — wild ideas welcome, build on each other's thinking. Make sure every student's voice is heard.`,

  milestoneIdeate: `Design a checkpoint showing students explored many ideas before picking their direction. Could include idea boards, a selection matrix, or short pitches explaining why they chose their approach.`,

  prototypeTest: `Plan activities where students build something real and test it with actual users. Build in cycles of: make it → test it → reflect → improve it. The final product should be shared with a real audience, not just the teacher.`,

  milestonePrototypeTest: `Design the final milestone where students present their work to a real audience — community members, experts, or stakeholders. Include time for students to reflect on their process, what they learned, and the impact of their work.`,

  agendaEventsContent: `Improve the activities for this agenda session. The activities should be specific, hands-on, and directly connected to the design thinking phase for this session. Include clear steps students will follow and materials they'll need. Keep activities student-centered and inquiry-driven.`,

  agendaReflection: `Improve the reflection prompt for this agenda session. The reflection should help students process what they learned, connect to the broader project goals, and prepare for the next session. Use open-ended questions that promote metacognition and critical thinking.`,
};

export function buildCellPrompt(
  cellId: string,
  cell: CellContent,
  content: BoardContent,
  context: BoardContext,
  feedback?: string,
): string {
  let effectiveCellId = cellId;
  let cellPrompt: string;
  if (cellId.startsWith("standards-")) {
    const subject = cellId.substring("standards-".length);
    effectiveCellId = "standards";
    cellPrompt =
      "Suggest relevant " +
      subject +
      " academic standards for this project. Include specific " +
      subject +
      " content standards with codes where possible (e.g. CCSS, NGSS, state standards). Standards should connect naturally to the project theme, not feel forced.";
  } else {
    cellPrompt =
      CELL_PROMPTS[cellId] ||
      "Generate content for the " +
        cell.label +
        " section of a PBL design board.";
  }
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
  lines.push(cellPrompt);
  lines.push("");
  if (contextStr) {
    lines.push("Project Context:");
    lines.push(contextStr);
    lines.push("");
  }

  // Remind AI about reading level for student-facing content
  if (STUDENT_FACING_CELLS.has(effectiveCellId) && context.gradeLevel) {
    lines.push(
      "IMPORTANT: This content will be seen by students. Write at a Grade " +
        context.gradeLevel +
        " reading level. Use vocabulary and sentence complexity appropriate for that age group.",
    );
    lines.push("");
  }

  lines.push("Current board content:");
  lines.push(existing);
  lines.push("");
  if (cell.value) {
    lines.push("Current value for this cell: " + JSON.stringify(cell.value));
    lines.push("Improve upon or offer alternatives.");
    lines.push("");
  } else {
    lines.push("This cell is currently empty.");
    lines.push("");
  }
  if (feedback) {
    lines.push("Teacher feedback on the current content: " + feedback);
    lines.push(
      "Revise the content based on this feedback. Provide exactly 1 suggestion that addresses the feedback. Keep the rationale short.",
    );
  } else {
    lines.push(
      "Provide 1-3 suggestions. Each should be specific and actionable. Keep rationales short and in plain language.",
    );
  }
  lines.push(
    "Structure your response as a bulleted list. Each key point gets a **bold title** on its own line, with the description as a sub-bullet on the NEXT line (not on the same line as the title). Use further sub-bullets for supporting details. No prose paragraphs.",
  );
  return lines.join("\n");
}
