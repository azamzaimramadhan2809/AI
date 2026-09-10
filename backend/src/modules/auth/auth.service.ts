import bcrypt from "bcrypt";

import { UsersService } from "@/modules/users/users.service";
import { generateToken } from "@/core/utils/jwt";

export class AuthService {

  constructor(
    private readonly usersService = new UsersService()
  ) {}

  async register(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {

    return this.usersService.createUser(data);

  }

  async login(data: {
    email: string;
    password: string;
  }) {

    const user =
      await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const validPassword =
      await bcrypt.compare(
        data.password,
        user.password
      );

    if (!validPassword) {
      throw new Error("Invalid email or password");
    }

    const token =
      generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

  }

  async me(userId: string) {

    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

  }

}