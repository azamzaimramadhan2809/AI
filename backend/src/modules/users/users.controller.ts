import { Response } from "express";
import { UsersService } from "./users.service";
import { AuthRequest } from "@/core/middleware/auth.middleware";

export class UsersController {
  constructor(
    private readonly usersService = new UsersService()
  ) {}

  async getProfile(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user!.userId;

      const user = await this.usersService.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
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

  async updateProfile(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user!.userId;

      const user = await this.usersService.updateProfile(
        userId,
        req.body
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
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
  
  async changePassword(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user!.userId;
  
      const {
        oldPassword,
        newPassword,
        confirmPassword,
      } = req.body;
  
      // ===============================
      // VALIDASI
      // ===============================
  
      // Semua field wajib diisi
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required",
        });
      }
  
      // Password minimal 8 karakter
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters",
        });
      }
  
      // Password maksimal 64 karakter
      if (newPassword.length > 64) {
        return res.status(400).json({
          success: false,
          message: "New password must not exceed 64 characters",
        });
      }
  
      // Password baru tidak boleh sama
      if (oldPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from old password",
        });
      }
  
      // Confirm password harus sama
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Confirm password does not match",
        });
      }
  
      // ===============================
      // UPDATE PASSWORD
      // ===============================
  
      await this.usersService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
  
      return res.json({
        success: true,
        message: "Password updated successfully",
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
  async deleteAccount(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user!.userId;

      await this.usersService.deleteAccount(userId);

      return res.json({
        success: true,
        message: "Account deleted successfully",
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
}