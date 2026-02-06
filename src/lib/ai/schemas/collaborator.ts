import { z } from "zod";

const proposedChangeSchema = z.object({
  cellId: z
    .string()
    .describe(
      "The board cell ID to change (e.g. 'mainIdea', 'empathize', 'standards-Math')",
    ),
  cellLabel: z.string().describe("Human-readable cell name for display"),
  currentValue: z
    .string()
    .describe("The cell's current content (for diff display)"),
  proposedValue: z
    .string()
    .describe("The proposed new content for this cell"),
  rationale: z
    .string()
    .describe("Brief explanation of why this change improves the board"),
});

export const collaboratorResponseSchema = z.object({
  message: z
    .string()
    .describe("Conversational analysis and explanation to the teacher"),
  proposedChanges: z
    .array(proposedChangeSchema)
    .describe(
      "Specific cell changes to propose — empty array if off-topic or no changes needed",
    ),
});

export type CollaboratorResponse = z.infer<typeof collaboratorResponseSchema>;
export type ProposedChange = z.infer<typeof proposedChangeSchema>;
