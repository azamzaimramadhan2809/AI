import { MemoryService } from "./memory.service";

export class MemoryManager {

  constructor(
    private readonly memoryService = new MemoryService()
  ) {}

  async save(
    aiId: string,
    content: string
  ) {

    const memory =
      this.extractMemory(content);

    // Bukan informasi penting
    if (!memory) {
      return null;
    }

    return this.memoryService.createMemory(
      aiId,
      memory
    );
  }

  private extractMemory(
    content: string
  ): string | null {

    const text =
      content.trim();

    if (!text) {
      return null;
    }

    const lower =
      text.toLowerCase();

    // =========================
    // JANGAN SIMPAN PERTANYAAN
    // =========================

    if (
      text.endsWith("?") ||
      lower.startsWith("apa ") ||
      lower.startsWith("siapa ") ||
      lower.startsWith("kapan ") ||
      lower.startsWith("dimana ") ||
      lower.startsWith("di mana ") ||
      lower.startsWith("kenapa ") ||
      lower.startsWith("mengapa ") ||
      lower.startsWith("bagaimana ") ||
      lower.startsWith("menurutmu ") ||
      lower.startsWith("apakah ")
    ) {
      return null;
    }

    // =========================
    // NAMA / IDENTITAS
    // =========================

    if (
      lower.includes("nama saya ") ||
      lower.includes("nama aku ") ||
      lower.includes("namaku ") ||
      lower.includes("saya adalah ") ||
      lower.includes("aku adalah ")
    ) {
      return text;
    }

    // =========================
    // PREFERENCE
    // =========================

    if (
      lower.includes("saya suka ") ||
      lower.includes("aku suka ") ||
      lower.includes("saya tidak suka ") ||
      lower.includes("aku tidak suka ") ||
      lower.includes("saya nggak suka ") ||
      lower.includes("aku nggak suka ")
    ) {
      return text;
    }

    // =========================
    // GOAL / KEINGINAN
    // =========================

    if (
      lower.includes("saya ingin ") ||
      lower.includes("aku ingin ") ||
      lower.includes("saya mau ") ||
      lower.includes("aku mau ") ||
      lower.includes("target saya ") ||
      lower.includes("targetku ")
    ) {
      return text;
    }

    // =========================
    // PROJECT
    // =========================

    if (
      lower.includes("project saya ") ||
      lower.includes("projectku ") ||
      lower.includes("proyek saya ") ||
      lower.includes("proyekku ")
    ) {
      return text;
    }

    // =========================
    // TIDAK ADA INFORMASI PENTING
    // =========================

    return null;
  }
}