import {
  ChatProviderInput,
  ChatProviderOutput,
} from "./provider.types";

export interface AIProvider {

  /**
   * Chat biasa (non-streaming)
   */
  chat(
    input: ChatProviderInput
  ): Promise<ChatProviderOutput>;

  /**
   * Chat streaming
   */
  stream(
    input: ChatProviderInput
  ): AsyncGenerator<string, ChatProviderOutput | void>;

}
