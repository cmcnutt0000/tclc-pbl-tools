import { z } from "zod";

const criterionFeedbackSchema = z.object({
  criterion: z.string().describe("Name of the HQPBL criterion"),
  rating: z
    .enum(["strong", "developing", "needs_attention"])
    .describe("Rating for this criterion"),
  feedback: z.string().describe("Detailed feedback on this criterion"),
  suggestions: z
    .array(z.string())
    .describe("1-3 actionable improvement suggestions"),
  relevantCells: z
    .array(z.string())
    .describe("Board cells most relevant to this criterion"),
});

export const hqpblFeedbackSchema = z.object({
  overallSummary: z
    .string()
    .describe("Overall assessment and most impactful next steps"),
  criteria: z
    .array(criterionFeedbackSchema)
    .describe("Feedback for each of the 6 HQPBL criteria"),
});

export type HqpblFeedbackOutput = z.infer<typeof hqpblFeedbackSchema>;
