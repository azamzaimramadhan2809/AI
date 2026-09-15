import { FunctionDeclaration } from "@google/genai";

export interface ProviderMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProviderToolCall {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ProviderToolResult {
  id?: string;
  name: string;
  result: unknown;
}

export interface ChatProviderInput {
  signal?: AbortSignal;
  systemPrompt: string;
  message: string;
  history?: ProviderMessage[];

  tools?: FunctionDeclaration[];

  toolResults?: ProviderToolResult[];

  toolCallContext?: unknown;
}

export interface ChatProviderOutput {
  text: string;

  toolCalls?: ProviderToolCall[];

  toolCallContext?: unknown;
}
