import { AI } from "@prisma/client";

import { PromptBuilder } from "./builders/prompt.builder";
import { ProviderFactory } from "./providers/provider.factory";
import { ProviderMessage } from "./providers/provider.types";

import { ToolExecutor } from "../tools/tool.executor";
import {
  toolRegistry,
  getToolDefinitions,
} from "../tools/tools.module";

export class AIChatService {

  private provider = ProviderFactory.create();

  private toolExecutor =
    new ToolExecutor(toolRegistry);

  async chat(data: {
    ai: AI;
    message: string;
    history?: ProviderMessage[];
    memories?: string[];
  }): Promise<string> {

    const systemPrompt =
      PromptBuilder.build(data.ai);

    const memoryContext =
      data.memories?.length
        ? `

Relevant Memories:
${data.memories
  .map((memory) => `- ${memory}`)
  .join("\n")}
`
        : "";

    const tools =
      getToolDefinitions();

      console.log(
        "🧰 AVAILABLE TOOLS:",
        tools.map((tool) => tool.name)
      );

    let result =
      await this.provider.chat({
        message: data.message,

        systemPrompt:
          systemPrompt + memoryContext,

        history: data.history,

        tools,
      });

    /*
     * Tool calling loop
     *
     * Gemini bisa meminta beberapa tool
     * dalam satu response.
     */
    for (let i = 0; i < 3; i++) {

      if (!result.toolCalls?.length) {
        return result.text;
      }

      const toolResults =
        await Promise.all(
          result.toolCalls.map(
            async (toolCall) => {

              const output =
                await this.toolExecutor.execute(
                  {
                    name: toolCall.name,

                    arguments:
                      toolCall.arguments,
                  },
                  {
                    userId: data.ai.userId,
                    aiId: data.ai.id,
                  }
                );

              return {
                id: toolCall.id,

                name: toolCall.name,

                result:
                  output.result,
              };
            }
          )
        );

      result =
        await this.provider.chat({
          message: "",

          systemPrompt:
            systemPrompt + memoryContext,

          history: data.history,

          tools,

          toolResults,

          toolCallContext:
            result.toolCallContext,
        });
    }

    return (
      result.text ||
      "Maaf, saya tidak dapat menyelesaikan permintaan tersebut."
    );
  }

  async *stream(data: {
    ai: AI;
    message: string;
    history?: ProviderMessage[];
    memories?: string[];
  }): AsyncGenerator<string> {

    const systemPrompt =
      PromptBuilder.build(data.ai);

    const memoryContext =
      data.memories?.length
        ? `

Relevant Memories:
${data.memories
  .map((memory) => `- ${memory}`)
  .join("\n")}
`
        : "";

    const stream =
      this.provider.stream({
        message: data.message,

        systemPrompt:
          systemPrompt + memoryContext,

        history: data.history,
      });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}