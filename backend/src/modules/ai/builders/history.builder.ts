import { MessageRole } from "@prisma/client";

import { ProviderMessage } from "../providers/provider.types";

export class HistoryBuilder {

  static build(messages: {
    role: MessageRole;
    content: string;
  }[]): ProviderMessage[] {

    return messages.map((message) => ({
      role: message.role === MessageRole.USER
        ? "user"
        : "assistant",

      content: message.content,
    }));

  }

}