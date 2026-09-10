import { MemoryRepository } from "./memory.repository";

export class MemoryService {

  constructor(
    private readonly repository = new MemoryRepository()
  ) {}

  async createMemory(
    aiId: string,
    content: string
  ) {
    return this.repository.create(
      aiId,
      content
    );
  }

  async getMemories(
    aiId: string
  ) {
    return this.repository.findAllByAIId(
      aiId
    );
  }

  async deleteMemory(
    id: string
  ) {
    return this.repository.delete(id);
  }

  async clearMemories(
    aiId: string
  ) {
    return this.repository.deleteAllByAIId(
      aiId
    );
  }

  async countMemories(
    aiId: string
  ) {
    return this.repository.countByAIId(
      aiId
    );
  }
}