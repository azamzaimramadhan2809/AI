import bcrypt from "bcrypt";

import { UsersRepository } from "./users.repository";

export class UsersService {
  constructor(
    private readonly repository = new UsersRepository()
  ) {}

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const emailExists =
      await this.repository.findByEmail(data.email);

    if (emailExists) {
      throw new Error("Email already exists");
    }

    const usernameExists =
      await this.repository.findByUsername(data.username);

    if (usernameExists) {
      throw new Error("Username already exists");
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 10);

    return this.repository.create({
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async findByUsername(username: string) {
    return this.repository.findByUsername(username);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      displayName?: string;
      bio?: string;
      avatar?: string;
    }
  ) {
    const user =
      await this.repository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (
      data.username &&
      data.username !== user.username
    ) {
      const usernameExists =
        await this.repository.findByUsername(
          data.username
        );

      if (usernameExists) {
        throw new Error("Username already exists");
      }
    }

    return this.repository.updateById(userId, {
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatar: data.avatar,
    });
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user =
      await this.repository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const match = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!match) {
      throw new Error("Old password is incorrect");
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await this.repository.updateById(
      userId,
      {
        password: hashedPassword,
      }
    );
  }

  async deleteAccount(userId: string) {
    const user =
      await this.repository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await this.repository.deleteById(userId);
  }
}
