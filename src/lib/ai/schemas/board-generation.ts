import { z } from "zod";

const baseBoardFields = {
  title: z.string().describe("A catchy project title"),
  mainIdea: z.string().describe("Main idea or topic for the project"),
  noticeReflect: z.string().describe("Notice and reflect activity"),
  communityPartners: z
    .string()
    .describe("Community partners relevant to the project and location"),
  openingActivity: z.string().describe("Engaging opening hook activity"),
  drivingQuestion: z.string().describe("Open-ended driving question"),
  empathize: z.string().describe("Empathy-building activities"),
  milestoneEmpathize: z
    .string()
    .describe("Checkpoint after empathy phase — what students demonstrate"),
  define: z.string().describe("Problem definition activities"),
  milestoneDefine: z
    .string()
    .describe("Checkpoint after define phase — clear problem statement"),
  ideate: z.string().describe("Ideation and brainstorming activities"),
  milestoneIdeate: z
    .string()
    .describe("Checkpoint after ideation — evidence of creative thinking"),
  prototypeTest: z.string().describe("Prototyping and testing activities"),
  milestonePrototypeTest: z
    .string()
    .describe("Final milestone — product presentation to authentic audience"),
};

export function createBoardVariationSchema(subjects: string[]) {
  return z.object({
    ...baseBoardFields,
    standards: z
      .array(
        z.object({
          subject: z.string().describe("The subject name"),
          content: z.string().describe("Academic standards for this subject"),
        }),
      )
      .describe("Standards for each subject: " + subjects.join(", ")),
  });
}

// Fallback for when no subjects are provided
export const boardVariationSchema = z.object({
  ...baseBoardFields,
  standards: z.string().describe("Relevant academic standards"),
});

export type BoardVariation = z.infer<typeof boardVariationSchema>;
