import {
  GoogleGenAI,
  Content,
  FunctionCallingConfigMode,
} from "@google/genai";

import { AIProvider } from "./provider.interface";

import {
  ChatProviderInput,
  ChatProviderOutput,
} from "./provider.types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  async chat(
    input: ChatProviderInput
  ): Promise<ChatProviderOutput> {

    const contents: Content[] = [];

    // ==========================================
    // SYSTEM PROMPT
    // ==========================================

    if (input.systemPrompt) {
      contents.push({
        role: "user",
        parts: [
          {
            text: input.systemPrompt,
          },
        ],
      });

      contents.push({
        role: "model",
        parts: [
          {
            text:
              "Baik, saya akan mengikuti semua instruksi tersebut.",
          },
        ],
      });
    }

    // ==========================================
    // HISTORY
    // ==========================================

    if (input.history?.length) {
      contents.push(
        ...input.history.map((message) => ({
          role:
            message.role === "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text: message.content,
            },
          ],
        }))
      );
    }

    // ==========================================
    // CURRENT USER MESSAGE
    // ==========================================

    if (input.message) {
      contents.push({
        role: "user",
        parts: [
          {
            text: input.message,
          },
        ],
      });
    }

    // ==========================================
    // PREVIOUS TOOL CALL
    // ==========================================

    if (input.toolCallContext) {
      contents.push(
        input.toolCallContext
      );
    }

    // ==========================================
    // TOOL RESULTS
    // ==========================================

    if (input.toolResults?.length) {
      contents.push({
        role: "user",

        parts:
          input.toolResults.map((tool) => ({
            functionResponse: {
              name: tool.name,

              response: {
                result: tool.result,
              },

              id: tool.id,
            },
          })),
      });
    }

    // ==========================================
    // GEMINI CONFIG
    // ==========================================

    const hasToolResult =
  Boolean(input.toolResults?.length);

    const config = input.tools?.length
      ? {
          tools: [
            {
              functionDeclarations:
                input.tools,
            },
          ],
    
          toolConfig: {
            functionCallingConfig: hasToolResult
              ? {
                  mode:
                    FunctionCallingConfigMode.AUTO,
                }
              : {
                  mode:
                    FunctionCallingConfigMode.ANY,
    
                  allowedFunctionNames: [
                    "calculator",
                  ],
                },
          },
        }
      : undefined;

    // ==========================================
    // GENERATE RESPONSE
    // ==========================================

    const response =
      await this.client.models.generateContent({
        model:
          process.env.GEMINI_MODEL ??
          "gemini-2.5-flash",

        contents,

        config,
      });

    // ==========================================
    // FUNCTION CALLS
    // ==========================================

    const functionCalls =
      response.functionCalls;

    const toolCalls =
      functionCalls
        ?.filter(
          (
            call
          ): call is typeof call & {
            name: string;
          } => Boolean(call.name)
        )
        .map(
          (call) => ({
            id: call.id,

            name: call.name,

            arguments:
              call.args ?? {},
          })
        );

    // ==========================================
    // TOOL CALL CONTEXT
    // ==========================================

    const toolCallContext =
      toolCalls?.length
        ? response.candidates?.[0]?.content
        : undefined;

    // ==========================================
    // TEXT RESPONSE
    // ==========================================

    const text =
      toolCalls?.length
        ? ""
        : response.text ?? "";

    return {
      text,

      toolCalls:
        toolCalls?.length
          ? toolCalls
          : undefined,

      toolCallContext,
    };
  }

  // ==========================================
  // STREAM
  // ==========================================

  async *stream(
    input: ChatProviderInput
  ): AsyncGenerator<string> {

    const contents: Content[] = [];

    // SYSTEM PROMPT
    if (input.systemPrompt) {
      contents.push({
        role: "user",

        parts: [
          {
            text: input.systemPrompt,
          },
        ],
      });

      contents.push({
        role: "model",

        parts: [
          {
            text:
              "Baik, saya akan mengikuti semua instruksi tersebut.",
          },
        ],
      });
    }

    // HISTORY
    if (input.history?.length) {
      contents.push(
        ...input.history.map((message) => ({
          role:
            message.role === "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text: message.content,
            },
          ],
        }))
      );
    }

    // CURRENT MESSAGE
    if (input.message) {
      contents.push({
        role: "user",

        parts: [
          {
            text: input.message,
          },
        ],
      });
    }

    // STREAM RESPONSE
    const response =
      await this.client.models.generateContentStream({
        model:
          process.env.GEMINI_MODEL ??
          "gemini-2.5-flash",

        contents,
      });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}