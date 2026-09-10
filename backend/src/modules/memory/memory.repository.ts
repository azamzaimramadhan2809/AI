import { prisma } from "@/database/prisma";

export class MemoryRepository {

  async create(
    aiId: string,
    content: string
  ) {
    return prisma.memory.create({
      data: {
        aiId,
        content,
      },
    });
  }

  async findAllByAIId(
    aiId: string
  ) {
    return prisma.memory.findMany({
      where: {
        aiId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async delete(
    id: string
  ) {
    return prisma.memory.delete({
      where: {
        id,
      },
    });
  }

  async deleteAllByAIId(
    aiId: string
  ) {
    return prisma.memory.deleteMany({
      where: {
        aiId,
      },
    });
  }

  async countByAIId(
    aiId: string
  ) {
    return prisma.memory.count({
      where: {
        aiId,
      },
    });
  }
}