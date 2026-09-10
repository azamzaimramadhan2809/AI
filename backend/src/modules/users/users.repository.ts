import { prisma } from "@/database/prisma";

export class UsersRepository {

  async create(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updateById(
    id: string,
    data: {
      username?: string;
      displayName?: string;
      bio?: string;
      avatar?: string;
      password?: string;
    }
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteById(id: string) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }

}