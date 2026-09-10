import { Response } from "express";

import { AuthRequest } from "@/core/middleware/auth.middleware";

import { ChatService } from "./chat.service";
import { createMessageSchema } from "./chat.validation";

export class ChatController {

  constructor(
    private readonly service = new ChatService()
  ) {}

  async sendMessage(
    req: AuthRequest,
    res: Response
  ) {

    try {

      const userId =
        req.user!.userId;

      const input =
        createMessageSchema.parse(req.body);

      const result =
        await this.service.sendMessage(
          userId,
          input
        );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });

    }
  }

  async streamMessage(
    req: AuthRequest,
    res: Response
  ) {

    try {

      const userId =
        req.user!.userId;

      const input =
        createMessageSchema.parse(req.body);

      res.setHeader(
        "Content-Type",
        "text/event-stream"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache"
      );

      res.setHeader(
        "Connection",
        "keep-alive"
      );

      res.flushHeaders();

      const stream =
        this.service.sendStream(
          userId,
          input
        );

      for await (const chunk of stream) {

        res.write(
          `data: ${JSON.stringify(chunk)}\n\n`
        );

      }

      res.write(
        "data: [DONE]\n\n"
      );

      res.end();

    } catch (error) {

      console.error(error);

      if (!res.headersSent) {

        return res.status(500).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Internal Server Error",
        });

      }

      res.end();
    }
  }

    async regenerate(
    req: AuthRequest,
    res: Response
  ) {

    try {

      const userId =
        req.user!.userId;

      const aiId =
        req.body.aiId;

      const messageId =
        req.body.messageId;

      if (
        typeof aiId !== "string" ||
        !aiId
      ) {

        return res.status(400).json({
          success: false,
          message: "aiId is required",
        });

      }

      if (
        typeof messageId !== "string" ||
        !messageId
      ) {

        return res.status(400).json({
          success: false,
          message: "messageId is required",
        });

      }

      const result =
        await this.service.regenerate(
          userId,
          aiId,
          messageId
        );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {

      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      if (message === "Forbidden") {

        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });

      }

      if (message === "Message not found") {

        return res.status(404).json({
          success: false,
          message: "Message not found",
        });

      }

      return res.status(400).json({
        success: false,
        message,
      });

    }
  }

    async getHistory(
    req: AuthRequest,
    res: Response
    ) {

    try {

      const userId =
        req.user!.userId;

      const aiId =
        req.query.aiId;

      if (typeof aiId !== "string" || !aiId) {

        return res.status(400).json({
          success: false,
          message: "aiId is required",
        });

      }

      const history =
        await this.service.getHistory(
          userId,
          aiId
        );

      return res.status(200).json({
        success: true,
        data: history,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });

    }
  }

  async deleteHistory(
    req: AuthRequest,
    res: Response
  ) {
  
    try {
  
      const userId =
        req.user!.userId;
  
      const aiId =
        req.query.aiId;
  
      if (typeof aiId !== "string" || !aiId) {
  
        return res.status(400).json({
          success: false,
          message: "aiId is required",
        });
  
      }
  
      await this.service.deleteHistory(
        userId,
        aiId
      );
  
      return res.status(200).json({
        success: true,
        message: "Chat history deleted",
      });
  
    } catch (error) {
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
  
    }
  }

  async resetMessages(
    req: AuthRequest,
    res: Response
  ) {
  
    try {
  
      const userId =
        req.user!.userId;
  
      const aiIdParam = req.params.aiId;

      const aiId = Array.isArray(aiIdParam)
        ? aiIdParam[0]
        : aiIdParam;
  
      if (!aiId) {
  
        return res.status(400).json({
          success: false,
          message: "aiId is required",
        });
  
      }
  
      const result =
        await this.service.resetMessages(
          userId,
          aiId
        );
  
      return res.status(200).json({
        success: true,
        message: "Messages reset successfully",
        data: result,
      });
  
    } catch (error) {
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
  
    }
  }
}