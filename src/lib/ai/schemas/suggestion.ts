import { z } from "zod";

export const cellSuggestionSchema = z.object({
  suggestions: z
    .array(
      z.object({
        text: z.string().describe("The suggested content for the cell"),
        rationale: z
          .string()
          .describe("Brief explanation of why this suggestion is effective"),
      }),
    )
    .describe("1-3 suggestions for the cell"),
});

export type CellSuggestionOutput = z.infer<typeof cellSuggestionSchema>;
