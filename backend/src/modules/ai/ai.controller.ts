import { z } from "zod";
import { sendApiError } from "@/core/errors/api-error";
import { Request, Response } from "express";

import { AIService } from "./ai.service";
import { updateAISchema } from "./ai.validation";
import { AIChatService } from "./ai.chat.service";
import { AuthRequest } from "@/core/middleware/auth.middleware";

export class AIController {
  constructor(
    private readonly service = new AIService(),
    private readonly chatService = new AIChatService()
  ) {}

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const ai = await this.service.createAI(
        req.user.userId,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "AI created successfully",
        data: ai,
      });
    } catch (error) {
      return sendApiError(res, error);
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const ais = await this.service.getMyAIs(
        req.user.userId
      );

      return res.json({
        success: true,
        data: ais,
      });
    } catch (error) {
      return sendApiError(res, error);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);

      const ai = await this.service.getMyAI(req.user!.userId, id);

      return res.json({
        success: true,
        data: ai,
      });
    } catch (error) {
      return sendApiError(res, error);
    }
  }

  async update(
    req: AuthRequest,
    res: Response
  ) {
  
    try {
  
      const userId =
        req.user!.userId;
  
      const id =
        String(req.params.id);
  
      // Validate body
      const input =
        updateAISchema.parse(req.body);
  
      const ai =
        await this.service.updateAI(
          userId,
          id,
          input
        );
  
      return res.status(200).json({
        success: true,
        message: "AI updated successfully",
        data: ai,
      });
  
    } catch (error) {
      return sendApiError(res, error);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
  
      await this.service.deleteAI(
        userId,
        id
      );
  
      return res.json({
        success: true,
        message: "AI deleted successfully",
      });
  
    } catch (error) {
      return sendApiError(res, error);
    }
  }

  /**
   * Test Gemini AI
   */
  async test(req: AuthRequest, res: Response) {
    try {
      const { aiId, message } = z.object({ aiId: z.string().trim().min(1), message: z.string().trim().min(1) }).parse(req.body);

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const reply = await this.chatService.chat({ ai: await this.service.getMyAI(req.user!.userId, aiId), message });

      return res.status(200).json({
        success: true,
        reply,
      });
    } catch (error) {
      return sendApiError(res, error);
    }
  }
}
