import { Response } from "express";

import { AuthRequest } from "@/core/middleware/auth.middleware";

import { ImageService } from "./image.service";
import { generateImageSchema } from "./image.validation";

export class ImageController {

  constructor(
    private readonly service = new ImageService()
  ) {}

  async generate(
    req: AuthRequest,
    res: Response
  ) {

    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const input =
        generateImageSchema.parse(req.body);

      const result =
        await this.service.generate(
          input.prompt
        );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {

      console.error(error);

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