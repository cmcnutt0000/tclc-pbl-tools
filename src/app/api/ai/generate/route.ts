import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { cellSuggestionSchema } from "@/lib/ai/schemas/suggestion";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildCellPrompt } from "@/lib/ai/prompts/cell-prompts";

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { cellId, cell, content, context, feedback } = await request.json();
    const prompt = buildCellPrompt(cellId, cell, content, context, feedback);
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: cellSuggestionSchema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });
    return Response.json(object);
  } catch (err: any) {
    const message = err?.responseBody || err?.message || "AI generation failed";
    console.error("AI generate error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
