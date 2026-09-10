import { prisma } from "@/database/prisma";

export class AIRepository {

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    avatar?: string;
    category?: string;
    prompt?: string;
    personality?: string;
    model?: string;
    memory?: boolean;
    assistantType?: string;
  }) {

    return prisma.aI.create({
      data,
    });

  }

  async findByUserId(userId: string) {

    return prisma.aI.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

  }

  async findById(id: string) {

    return prisma.aI.findUnique({
      where: {
        id,
      },
    });

  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      avatar?: string;
      category?: string;
      prompt?: string;
      personality?: string;
      model?: string;
      memory?: boolean;
      assistantType?: string;
      isPinned?: boolean;
    }
  ) {

    return prisma.aI.update({
      where: {
        id,
      },
      data,
    });

  }

  async delete(id: string) {

    return prisma.aI.delete({
      where: {
        id,
      },
    });

  }

  async countByUserId(userId: string) {

    return prisma.aI.count({
      where: {
        userId,
      },
    });

  }

}