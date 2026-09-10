import { prisma } from "@/database/prisma";
import { MessageRole, MessageType } from "@prisma/client";

export class ChatRepository {

  /**
   * Create Message
   */
  async create(data: {
    aiId: string;
    role: MessageRole;
    content: string;
    type?: MessageType;
    metadata?: object;
  }) {

    return prisma.message.create({
      data: {
        aiId: data.aiId,
        role: data.role,
        content: data.content,
        type: data.type ?? MessageType.TEXT,
        metadata: data.metadata,
      },
    });

  }

  /**
   * Get All Messages By AI ID
   */
  async findAllByAIId(aiId: string) {

    return prisma.message.findMany({
      where: {
        aiId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  }

  /**
   * Get Latest Messages
   */
  async findLatestMessages(
    aiId: string,
    limit = 20
  ) {
  
    return prisma.message.findMany({
      where: {
        aiId,
      },
  
      orderBy: {
        createdAt: "desc",
      },
  
      take: limit,
    });
  
  }

  /**
   * Search Messages
   */
  async search(aiId: string, keyword: string) {

    return prisma.message.findMany({
      where: {
        aiId,
        content: {
          contains: keyword,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  }

  /**
   * Get Chat History
   */
  
  
  async getHistory(aiId: string) {
  
    return prisma.message.findMany({
      where: {
        aiId,
      },
  
      orderBy: {
        createdAt: "asc",
      },
    });
  
  }

  /**
   * Delete All Messages By AI ID
   */
  async deleteAllByAIId(aiId: string) {

    return prisma.message.deleteMany({
      where: {
        aiId,
      },
    });

  }

  /**
   * Count Messages By AI ID
   */
  async deleteMessagesByAI(
    aiId: string
  ): Promise<void> {
  
    await prisma.message.deleteMany({
      where: {
        aiId,
      },
    });
  }
  
  async countByAIId(aiId: string) {

    return prisma.message.count({
      where: {
        aiId,
      },
    });
  }

  async findById(id: string) {
  return prisma.message.findUnique({
    where: {
      id,
    },
  });
}

async findMessagesBefore(
  aiId: string,
  createdAt: Date
) {
  return prisma.message.findMany({
    where: {
      aiId,
      createdAt: {
        lt: createdAt,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async update(
    id: string,
    content: string
  ) {
    return prisma.message.update({
      where: {
        id,
      },
      data: {
        content,
        editedAt: new Date(),
      },
    });
  }
}