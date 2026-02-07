import { z } from "zod";

export const lessonPlanGenerationSchema = z.object({
  learningObjectives: z
    .string()
    .describe(
      "2-4 student-centered learning objectives as a bulleted markdown list. " +
        "Use 'Students will be able to...' framing. Align to the subject standards.",
    ),
  materials: z
    .string()
    .describe(
      "Materials and resources needed, as a bulleted markdown list. " +
        "Include both physical materials and digital resources.",
    ),
  warmUpHook: z
    .string()
    .describe(
      "A 5-10 minute warm-up or hook activity that connects to students' " +
        "lives, sparks curiosity, and activates prior knowledge. Must be " +
        "hands-on and inquiry-driven, NOT a lecture or worksheet. " +
        "Format as bulleted markdown with bold headers.",
    ),
  mainActivities: z
    .string()
    .describe(
      "The core lesson activities with time allocations. Each activity gets " +
        "a bold header with duration (e.g. '**Gallery Walk (15 min)**') on its " +
        "own line, with description and steps as sub-bullets on following lines. " +
        "Activities must be student-centered, inquiry-driven, collaborative, " +
        "and connected to the PBL project. Total time should fit within the period length.",
    ),
  closingExitTicket: z
    .string()
    .describe(
      "A 5-10 minute closing activity and/or exit ticket. Should promote " +
        "metacognition and reflection (Freire's praxis). Format as bulleted " +
        "markdown with bold headers.",
    ),
  differentiationNotes: z
    .string()
    .describe(
      "Notes on differentiation: scaffolding for struggling learners, " +
        "extensions for advanced learners, accommodations for diverse needs. " +
        "Include multiple entry points. " +
        "Format as bulleted markdown with bold headers.",
    ),
  standardsAddressed: z
    .string()
    .describe(
      "Specific academic standards this lesson addresses, with codes " +
        "where possible. Format as bulleted markdown.",
    ),
});

export type LessonPlanGeneration = z.infer<typeof lessonPlanGenerationSchema>;
