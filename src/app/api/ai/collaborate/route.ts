import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { collaboratorResponseSchema } from "@/lib/ai/schemas/collaborator";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildCollaboratorPrompt } from "@/lib/ai/prompts/collaborator-prompt";
import { buildLessonCollaboratorPrompt } from "@/lib/ai/prompts/lesson-collaborator-prompt";

export const maxDuration = 120;

const anthropic = createAnthropic({
  apiKey: process.env.TCLC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, context, userMessage, lessons, mode } =
      await request.json();
    const prompt =
      mode === "lessons"
        ? buildLessonCollaboratorPrompt(
            content,
            context,
            lessons || [],
            userMessage,
          )
        : buildCollaboratorPrompt(content, context, userMessage, lessons);
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: collaboratorResponseSchema,
      system: PBL_SYSTEM_PROMPT,
      prompt,
    });
    return Response.json(object);
  } catch (err: any) {
    const message =
      err?.responseBody || err?.message || "AI collaboration failed";
    console.error("AI collaborate error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
