import { GoogleGenAI, Content, FunctionCallingConfigMode } from "@google/genai";
import { AIProvider } from "./provider.interface";
import { ChatProviderInput, ChatProviderOutput } from "./provider.types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  private buildContents(input: ChatProviderInput): Content[] {
    // Continuations preserve the original message and every tool turn.
    const contents: Content[] = Array.isArray(input.toolCallContext)
      ? [...input.toolCallContext]
      : [
          ...(input.history ?? []).map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          ...(input.message ? [{ role: "user", parts: [{ text: input.message }] }] : []),
          ...(input.toolCallContext ? [input.toolCallContext as Content] : []),
        ];
    if (input.toolResults?.length) {
      contents.push({ role: "user", parts: input.toolResults.map(tool => ({
        functionResponse: { name: tool.name, id: tool.id, response: { result: tool.result } },
      })) });
    }
    return contents;
  }

  private config(input: ChatProviderInput) {
    if (!input.tools?.length && !input.systemPrompt && !input.signal) return undefined;
    return {
      ...(input.signal ? { abortSignal: input.signal } : {}),
      ...(input.systemPrompt ? { systemInstruction: input.systemPrompt } : {}),
      ...(input.tools?.length ? {
        tools: [{ functionDeclarations: input.tools }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
      } : {}),
    };
  }

  private output(contents: Content[], modelContent: Content, text: string): ChatProviderOutput {
    const toolCalls = modelContent.parts?.flatMap(part => {
      const call = part.functionCall;
      return call?.name ? [{ id: call.id, name: call.name, arguments: call.args ?? {} }] : [];
    });
    return {
      text: toolCalls?.length ? "" : text,
      toolCalls: toolCalls?.length ? toolCalls : undefined,
      // Preserve complete model parts, including thought signatures.
      toolCallContext: toolCalls?.length ? [...contents, modelContent] : undefined,
    };
  }

  async chat(input: ChatProviderInput): Promise<ChatProviderOutput> {
    const contents = this.buildContents(input);
    const response = await this.client.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents, config: this.config(input),
    });
    const modelContent = response.candidates?.[0]?.content ?? {
      role: "model", parts: response.functionCalls?.map(functionCall => ({ functionCall })),
    };
    return this.output(contents, modelContent, response.functionCalls?.length ? "" : response.text ?? "");
  }

  async *stream(input: ChatProviderInput): AsyncGenerator<string, ChatProviderOutput> {
    const contents = this.buildContents(input);
    const response = await this.client.models.generateContentStream({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents, config: this.config(input),
    });
    const modelContent: Content = { role: "model", parts: [] };
    let text = "";
    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      modelContent.parts!.push(...parts);
      for (const part of parts) {
        if (part.text && !part.thought) {
          text += part.text;
          yield part.text;
        }
      }
    }
    return this.output(contents, modelContent, text);
  }
}
