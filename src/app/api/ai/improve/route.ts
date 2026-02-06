import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { hqpblFeedbackSchema } from "@/lib/ai/schemas/hqpbl-feedback";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildHqpblPrompt } from "@/lib/ai/prompts/hqpbl-prompt";

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const prompt = buildHqpblPrompt(content);
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: hqpblFeedbackSchema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });
    return Response.json(object);
  } catch (err: any) {
    const message =
      err?.responseBody || err?.message || "HQPBL evaluation failed";
    console.error("AI improve error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
