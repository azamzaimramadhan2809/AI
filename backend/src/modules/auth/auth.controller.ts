import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { AuthRequest } from "@/core/middleware/auth.middleware";

export class AuthController {
  constructor(
    private readonly authService = new AuthService()
  ) {}

  async register(req: Request, res: Response) {
    try {
      const user = await this.authService.register(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await this.authService.me(
        req.user!.userId
      );

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}