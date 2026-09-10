import { MemoryService } from "./memory.service";

export class MemoryRetriever {

  constructor(
    private readonly memoryService = new MemoryService()
  ) {}

  async retrieve(
    aiId: string,
    query: string
  ) {

    const memories =
      await this.memoryService.getMemories(aiId);

    if (!memories.length) {
      return [];
    }

    const keywords =
      this.extractKeywords(query);

    if (!keywords.length) {
      return [];
    }

    return memories.filter((memory) => {

      const content =
        memory.content.toLowerCase();

      return keywords.some((keyword) =>
        content.includes(keyword)
      );

    });
  }

  private extractKeywords(
    query: string
  ): string[] {

    return query
      .toLowerCase()
      .split(/\s+/)
      .map((word) =>
        word.replace(/[^\p{L}\p{N}]/gu, "")
      )
      .filter((word) =>
        word.length >= 4
      );
  }
}