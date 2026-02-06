import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  boardVariationSchema,
  createBoardVariationSchema,
} from "@/lib/ai/schemas/board-generation";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildBoardPrompt } from "@/lib/ai/prompts/board-prompt";

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, context, feedback, previousVariation } =
      await request.json();
    const prompt = buildBoardPrompt(
      content,
      context,
      feedback,
      previousVariation,
    );
    const subjects: string[] = context?.subjects || [];
    const schema =
      subjects.length > 0
        ? createBoardVariationSchema(subjects)
        : boardVariationSchema;
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });
    return Response.json({ variation: object });
  } catch (err: any) {
    const message =
      err?.responseBody || err?.message || "Board generation failed";
    console.error("AI generate-board error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
