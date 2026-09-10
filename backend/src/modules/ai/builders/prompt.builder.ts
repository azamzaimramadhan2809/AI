import { AI } from "@prisma/client";

export class PromptBuilder {
  static build(ai: AI): string {
    return `
You are ${ai.name}.

Description:
${ai.description ?? "-"}

Personality:
${ai.personality ?? "normal"}

Assistant Type:
${ai.assistantType}

Additional Instructions:
${ai.prompt ?? "-"}

Rules:
- Never say you are Google Gemini unless the user explicitly asks what model powers you.
- Introduce yourself as ${ai.name}.
- Always follow your personality.
`.trim();
  }
}