import { z } from "zod";

export const agendaGenerationSchema = z.object({
  sessions: z.array(
    z.object({
      title: z
        .string()
        .describe(
          "Short title for this session, e.g. 'Empathy Interviews' or 'Define the Problem'",
        ),
      eventsContent: z
        .string()
        .describe(
          "What happens this day — activities, key tasks, structured as bullet points",
        ),
      designPhase: z
        .string()
        .describe(
          "Which design thinking phase this maps to (Opening, Empathize, Define, Ideate, Prototype & Test, Presentation)",
        ),
      reflection: z
        .string()
        .describe("Reflection prompt or closing activity for this session"),
    }),
  ),
});

export type AgendaGeneration = z.infer<typeof agendaGenerationSchema>;
