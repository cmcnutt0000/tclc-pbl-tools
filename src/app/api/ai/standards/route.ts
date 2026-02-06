import { streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { cellSuggestionSchema } from "@/lib/ai/schemas/suggestion";
import { PBL_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";

export async function POST(request: Request) {
  const { topic, state, gradeLevel } = await request.json();
  const lines: string[] = [];
  lines.push("Find relevant academic standards for:");
  lines.push("");
  lines.push("Topic: " + topic);
  if (state) lines.push("State: " + state);
  if (gradeLevel) lines.push("Grade Level: " + gradeLevel);
  lines.push("");
  lines.push("Provide 1-3 suggestions of relevant standards with codes and descriptions.");
  const prompt = lines.join("\n");
  const result = streamObject({
    model: anthropic("claude-sonnet-4-5-20250929"),
    schema: cellSuggestionSchema,
    system: PBL_SYSTEM_PROMPT,
    prompt,
  });
  return result.toTextStreamResponse();
}