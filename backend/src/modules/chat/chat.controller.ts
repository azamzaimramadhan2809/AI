import { sendApiError } from "@/core/errors/api-error";
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
      return sendApiError(res, error);
    }
  }

  async streamMessage(
    req: AuthRequest,
    res: Response
  ) {

    const cancellation = new AbortController();
    const onClose = () => { if (!res.writableEnded) cancellation.abort(); };
    res.on?.('close', onClose);
    let stream: AsyncGenerator<string> | undefined;
    try {

      const userId =
        req.user!.userId;

      const input =
        createMessageSchema.parse(req.body);

      await this.service.assertAccess(userId, input.aiId);
      stream = this.service.sendStream(userId, input, cancellation.signal);
      const first = await stream.next();
      cancellation.signal.throwIfAborted();

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

      if (!first.done) res.write(`data: ${JSON.stringify(first.value)}\n\n`);

      for await (const chunk of stream) {

        cancellation.signal.throwIfAborted();
        res.write(
          `data: ${JSON.stringify(chunk)}\n\n`
        );

      }

      res.write(
        "data: [DONE]\n\n"
      );

      res.end();

    } catch (error) {
      if (!cancellation.signal.aborted) return sendApiError(res, error);
    } finally {
      res.off?.('close', onClose);
      await stream?.return(undefined).catch(() => {});
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
        req.body?.aiId;

      const messageId =
        req.body?.messageId;

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
      return sendApiError(res, error);
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
      return sendApiError(res, error);
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
      return sendApiError(res, error);
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
      return sendApiError(res, error);
    }
  }
}
