import { MessageRole } from "@prisma/client";

import { AIService } from "../ai/ai.service";
import { AIChatService } from "../ai/ai.chat.service";

import { HistoryBuilder } from "../ai/builders/history.builder";
import { ProviderMessage } from "../ai/providers/provider.types";

import { ChatRepository } from "./chat.repository";
import { CreateMessageInput } from "./chat.validation";

import { MemoryRetriever } from "../memory/memory.retriever";
import { MemoryManager } from "../memory/memory.manager";

export class ChatService {

  constructor(
    private readonly repository = new ChatRepository(),
    private readonly aiService = new AIService(),
    private readonly aiChatService = new AIChatService(),
    private readonly memoryRetriever = new MemoryRetriever(),
    private readonly memoryManager = new MemoryManager()
  ) {}

  async assertAccess(userId: string, aiId: string): Promise<void> {
    await this.aiService.getMyAI(userId, aiId);
  }

  private async buildHistory(
    aiId: string,
    memory: boolean,
    sessionHistory?: ProviderMessage[]
  ): Promise<ProviderMessage[]> {

    // =========================
    // MEMORY OFF
    // =========================
    // Jangan ambil history dari database.
    // Gunakan history sementara dari client.
    if (!memory) {
      return sessionHistory ?? [];
    }

    // =========================
    // MEMORY ON
    // =========================
    // Ambil history permanen dari database.
    const history =
      await this.repository.findLatestMessages(
        aiId,
        20
      );

    history.reverse();

    return HistoryBuilder.build(history);
  }

  private async saveUserMessage(
    aiId: string,
    content: string
  ): Promise<void> {

    await this.repository.create({
      aiId,
      role: MessageRole.USER,
      content,
    });
  }

  private async saveAssistantMessage(
    aiId: string,
    content: string
  ): Promise<void> {

    await this.repository.create({
      aiId,
      role: MessageRole.ASSISTANT,
      content,
    });
  }

  async sendMessage(
  userId: string,
  input: CreateMessageInput
) {

  // 1. Pastikan AI milik user
  const ai =
    await this.aiService.getMyAI(
      userId,
      input.aiId
    );

  // 2. Tentukan memory yang digunakan
  //
  // Kalau request mengirim memory,
  // gunakan nilai tersebut.
  //
  // Kalau tidak mengirim memory,
  // gunakan setting memory milik AI.
  const memory =
    input.memory ?? ai.memory;

  // 3. Ambil history sesuai mode
  const providerHistory =
    await this.buildHistory(
      ai.id,
      memory,
      input.sessionHistory
    );

  // 4. Ambil memory yang relevan
  //
  // Hanya melakukan retrieval
  // kalau Memory ON.
  const memories =
    memory
      ? await this.memoryRetriever.retrieve(
          ai.id,
          input.content
        )
      : [];

  // 5. Simpan pesan USER
  // hanya kalau Memory ON
  if (memory) {
    await this.saveUserMessage(
      ai.id,
      input.content
    );
  
    await this.memoryManager.save(
      ai.id,
      input.content
    );
  }

  // 6. Kirim pesan ke AI
  const reply =
    await this.aiChatService.chat({
      ai,
      message: input.content,
      history: providerHistory,

      // Kirim isi memory yang relevan
      // ke AIChatService
      memories: memories.map(
        (memory) => memory.content
      ),
    });

  // 7. Simpan balasan AI
  // hanya kalau Memory ON
  if (memory) {

    await this.saveAssistantMessage(
      ai.id,
      reply
    );
  }

  // 8. Return response
  return {
    reply,
  };
}


async *sendStream(
  userId: string,
  input: CreateMessageInput,
  signal?: AbortSignal
): AsyncGenerator<string> {

  signal?.throwIfAborted();
  // 1. Pastikan AI milik user
  const ai =
    await this.aiService.getMyAI(
      userId,
      input.aiId
    );

  // 2. Tentukan memory yang digunakan
  const memory =
    input.memory ?? ai.memory;

  // 3. Ambil history sesuai mode
  const providerHistory =
    await this.buildHistory(
      ai.id,
      memory,
      input.sessionHistory
    );

  // 4. Ambil memory yang relevan
  //
  // Hanya melakukan retrieval
  // kalau Memory ON.
  const memories =
    memory
      ? await this.memoryRetriever.retrieve(
          ai.id,
          input.content
        )
      : [];

  signal?.throwIfAborted();
  // 5. Simpan pesan USER
  // hanya kalau Memory ON
  if (memory) {
  
    await this.saveUserMessage(
      ai.id,
      input.content
    );
  
    await this.memoryManager.save(
      ai.id,
      input.content
    );
  }

  // 6. Jalankan streaming AI
  const stream =
    this.aiChatService.stream({
      ai,
      signal,
      message: input.content,
      history: providerHistory,

      // Kirim memory yang relevan
      memories: memories.map(
        (memory) => memory.content
      ),
    });

  // 7. Gabungkan semua chunk
  // untuk disimpan sebagai satu message
  let fullReply = "";

  for await (const chunk of stream) {

    console.log(
      "STREAM CHUNK:",
      JSON.stringify(chunk)
    );

    signal?.throwIfAborted();
    fullReply += chunk;

    // Kirim chunk langsung ke client
    yield chunk;
  }

  // 8. Debug hasil lengkap
  console.log(
    "FULL REPLY:",
    JSON.stringify(fullReply)
  );

  signal?.throwIfAborted();
  // 9. Simpan balasan AI
  // hanya kalau Memory ON
  // dan response tidak kosong
  if (
    memory &&
    fullReply.trim()
  ) {

    await this.saveAssistantMessage(
      ai.id,
      fullReply
    );

    console.log(
      "ASSISTANT MESSAGE SAVED"
    );
  }
}

    async regenerate(
    userId: string,
    aiId: string,
    messageId: string
  ) {

    // 1. Pastikan AI memang milik user
    const ai =
      await this.aiService.getMyAI(
        userId,
        aiId
      );

    // 2. Cari message yang mau di-regenerate
    const message =
      await this.repository.findById(
        messageId
      );

    if (!message) {
      throw new Error(
        "Message not found"
      );
    }

    // 3. Pastikan message milik AI tersebut
    if (message.aiId !== ai.id) {
      throw new Error(
        "Forbidden"
      );
    }

    // 4. Hanya ASSISTANT yang boleh di-regenerate
    if (
      message.role !==
      MessageRole.ASSISTANT
    ) {
      throw new Error(
        "Only assistant messages can be regenerated"
      );
    }

    // 5. Ambil semua message sebelum
    //    response assistant tersebut
    const previousMessages =
      await this.repository.findMessagesBefore(
        ai.id,
        message.createdAt
      );

    // 6. Ubah history database
    //    menjadi format provider
    const history =
      HistoryBuilder.build(
        previousMessages
      );

    // 7. Cari USER message terakhir
    const lastUserMessage =
      [...previousMessages]
        .reverse()
        .find(
          item =>
            item.role ===
            MessageRole.USER
        );

    if (!lastUserMessage) {
      throw new Error(
        "User message not found"
      );
    }

    // 8. Generate jawaban baru
    const reply =
      await this.aiChatService.chat({
        ai,
        message:
          lastUserMessage.content,
        history,
      });

    // 9. Update message assistant lama
    const updated =
      await this.repository.update(
        message.id,
        reply
      );

    // 10. Return hasil
    return {
      message: updated,
    };
  }

    async getHistory(
    userId: string,
    aiId: string
    )
     {

    // 1. Pastikan AI memang milik user
    const ai = await this.aiService.getMyAI(
      userId,
      aiId
    );

    // 2. Ambil pesan dari database
    const messages =
      await this.repository.findLatestMessages(
        ai.id,
        100
      );

    // 3. Urutkan dari pesan paling lama → terbaru
    messages.reverse();

    // 4. Return history
    return messages;
  }

  async deleteHistory(
    userId: string,
    aiId: string
  ): Promise<void> {
  
    // Pastikan AI memang milik user
    const ai = await this.aiService.getMyAI(
      userId,
      aiId
    );
  
    // Hapus semua message AI tersebut
    await this.repository.deleteAllByAIId(
      ai.id
    );
  }

  async resetMessages(
    userId: string,
    aiId: string
  ) {
  
    // 1. Pastikan AI memang milik user
    const ai = await this.aiService.getMyAI(
      userId,
      aiId
    );
  
    // 2. Hapus semua pesan AI tersebut
    const result =
      await this.repository.deleteAllByAIId(
        ai.id
      );
  
    // 3. Return hasil
    return {
      deletedCount: result.count,
    };
  }
}
