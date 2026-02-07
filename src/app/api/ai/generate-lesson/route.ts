import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { lessonPlanGenerationSchema } from "@/lib/ai/schemas/lesson-generation";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildLessonPrompt } from "@/lib/ai/prompts/lesson-prompt";

export const maxDuration = 120;

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      content,
      context,
      agendaEntry,
      sessionIndex,
      subject,
      periodMinutes,
    } = await request.json();

    const prompt = buildLessonPrompt(
      content,
      context,
      agendaEntry,
      sessionIndex,
      subject,
      periodMinutes,
    );

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: lessonPlanGenerationSchema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });

    return Response.json(object);
  } catch (err: any) {
    const message =
      typeof err?.responseBody === "string"
        ? err.responseBody
        : err?.message || "Lesson generation failed";
    console.error("AI generate-lesson error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
