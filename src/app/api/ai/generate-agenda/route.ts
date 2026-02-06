import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { agendaGenerationSchema } from "@/lib/ai/schemas/agenda-generation";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildAgendaPrompt } from "@/lib/ai/prompts/agenda-prompt";

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, context, numDays } = await request.json();
    const prompt = buildAgendaPrompt(content, context, numDays);
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: agendaGenerationSchema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });
    return Response.json(object);
  } catch (err: any) {
    const message =
      err?.responseBody || err?.message || "Agenda generation failed";
    console.error("AI generate-agenda error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
