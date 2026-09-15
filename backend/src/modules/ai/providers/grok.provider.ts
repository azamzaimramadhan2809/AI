import { AIProvider } from "./provider.interface";
import {
  ChatProviderInput,
  ChatProviderOutput,
} from "./provider.types";

export class GrokProvider implements AIProvider {

  private readonly apiUrl =
    "https://api.x.ai/v1/chat/completions";

  private readonly apiKey =
    process.env.GROK_API_KEY;

  private readonly model =
    process.env.GROK_MODEL ?? "grok-4.5";

  private buildMessages(
    input: ChatProviderInput
  ) {

    return [
      {
        role: "system",
        content: input.systemPrompt,
      },

      ...(input.history ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),

      {
        role: "user",
        content: input.message,
      },
    ];
  }

  async chat(
    input: ChatProviderInput
  ): Promise<ChatProviderOutput> {

    if (!this.apiKey) {
      throw new Error(
        "GROK_API_KEY is not configured"
      );
    }

    const response = await fetch(
      this.apiUrl,
      {
        method: "POST",
        signal: input.signal,

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },

        body: JSON.stringify({
          model: this.model,

          messages:
            this.buildMessages(input),

          stream: false,
        }),
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Grok API Error ${response.status}: ${errorText}`
      );
    }

    const data =
      await response.json() as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

    const text =
      data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error(
        "Grok returned an empty response"
      );
    }

    return {
      text,
    };
  }

  async *stream(
    input: ChatProviderInput
  ): AsyncGenerator<string> {

    if (!this.apiKey) {
      throw new Error(
        "GROK_API_KEY is not configured"
      );
    }

    const response = await fetch(
      this.apiUrl,
      {
        method: "POST",
        signal: input.signal,

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },

        body: JSON.stringify({
          model: this.model,

          messages:
            this.buildMessages(input),

          stream: true,
        }),
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Grok API Error ${response.status}: ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error(
        "Grok response body is empty"
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    while (true) {

      const { value, done } =
        await reader.read();

      if (done) {
        break;
      }

      buffer +=
        decoder.decode(
          value,
          { stream: true }
        );

      const events =
        buffer.split("\n\n");

      buffer =
        events.pop() ?? "";

      for (const event of events) {

        const lines =
          event.split("\n");

        for (const line of lines) {

          if (!line.startsWith("data:")) {
            continue;
          }

          const data =
            line.slice(5).trim();

          if (data === "[DONE]") {
            return;
          }

          try {

            const parsed =
              JSON.parse(data) as {
                choices?: Array<{
                  delta?: {
                    content?: string;
                  };
                }>;
              };

            const text =
              parsed.choices?.[0]?.delta?.content;

            if (text) {
              yield text;
            }

          } catch {
            // Ignore malformed/incomplete SSE chunks
          }
        }
      }
    }
  }
}
