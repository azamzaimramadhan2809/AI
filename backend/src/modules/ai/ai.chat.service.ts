import { ApiError, providerError } from "@/core/errors/api-error";
import { AI } from "@prisma/client";
import { PromptBuilder } from "./builders/prompt.builder";
import { ProviderFactory } from "./providers/provider.factory";
import { AIProvider } from "./providers/provider.interface";
import { ChatProviderInput, ChatProviderOutput, ProviderMessage } from "./providers/provider.types";
import { ToolExecutor } from "../tools/tool.executor";
import { toolRegistry, getToolDefinitions } from "../tools/tools.module";

interface ChatData {
  signal?: AbortSignal;
  ai: AI;
  message: string;
  history?: ProviderMessage[];
  memories?: string[];
}

export class AIChatService {
  constructor(
    private readonly provider: AIProvider = ProviderFactory.create(),
    private readonly toolExecutor = new ToolExecutor(toolRegistry),
  ) {}

  private input(data: ChatData): ChatProviderInput {
    const memories = data.memories?.length
      ? "\n\nRelevant Memories:\n" + data.memories.map(memory => "- " + memory).join("\n")
      : "";
    return {
      message: data.message,
      signal: data.signal,
      systemPrompt: PromptBuilder.build(data.ai) + memories,
      history: data.history,
      tools: getToolDefinitions(),
    };
  }

  private async continueWithTools(input: ChatProviderInput, result: ChatProviderOutput, data: ChatData) {
    const toolResults = await Promise.all(result.toolCalls!.map(async call => {
      data.signal?.throwIfAborted();
      const output = await this.toolExecutor.execute(
        { name: call.name, arguments: call.arguments },
        { userId: data.ai.userId, aiId: data.ai.id },
      );
      return { id: call.id, name: call.name, result: output.result };
    }));
    return { ...input, toolResults, toolCallContext: result.toolCallContext };
  }

  async chat(data: ChatData): Promise<string> {
    let input = this.input(data);
    for (let round = 0; round <= 3; round++) {
      const result = await this.provider.chat(input).catch(error => { data.signal?.throwIfAborted(); throw providerError(error); });
      if (!result.toolCalls?.length) {
        if (!result.text.trim()) throw new ApiError(502, "AI returned an empty response");
        return result.text;
      }
      if (round === 3) throw new ApiError(502, "AI tool call limit exceeded");
      input = await this.continueWithTools(input, result, data);
    }
    throw new ApiError(502, "AI tool call limit exceeded");
  }

  async *stream(data: ChatData): AsyncGenerator<string> {
    let input = this.input(data);
    for (let round = 0; round <= 3; round++) {
      data.signal?.throwIfAborted();
      const stream = this.provider.stream(input);
      let result: ChatProviderOutput | void;
      let text = "";
      try {
        while (true) {
          const next = await stream.next().catch(error => { data.signal?.throwIfAborted(); throw providerError(error); });
          if (next.done) {
            result = next.value;
            break;
          }
          data.signal?.throwIfAborted();
          text += next.value;
          yield next.value;
        }
      } finally {
        await stream.return(undefined);
      }
      if (!result?.toolCalls?.length) {
        if (!text.trim()) throw new ApiError(502, "AI returned an empty response");
        return;
      }
      if (round === 3) throw new ApiError(502, "AI tool call limit exceeded");
      input = await this.continueWithTools(input, result, data);
    }
  }
}
