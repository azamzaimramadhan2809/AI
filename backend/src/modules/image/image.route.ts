import { Router } from "express";

import { authMiddleware } from "@/core/middleware/auth.middleware";

import { ImageController } from "./image.controller";

const router = Router();

const controller =
  new ImageController();

router.post(
  "/generate",
  authMiddleware,
  controller.generate.bind(controller)
);

export default router;