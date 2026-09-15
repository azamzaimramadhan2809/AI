import { profileSchema, passwordSchema } from "../auth/auth.validation";
import { sendApiError } from "@/core/errors/api-error";
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
      return sendApiError(res, error);
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
        profileSchema.parse(req.body)
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      return sendApiError(res, error);
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
      } = passwordSchema.parse(req.body);
  
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
      return sendApiError(res, error);
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
      return sendApiError(res, error);
    }
  }
}
