import { Router } from "express";
import { ChatController } from "./chat.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";

const router = Router();
const controller = new ChatController();

router.post(
  "/send",
  authMiddleware,
  controller.sendMessage.bind(controller)
);

router.post(
  "/stream",
  authMiddleware,
  controller.streamMessage.bind(controller)
);

router.get(
  "/history",
  authMiddleware,
  controller.getHistory.bind(controller)
);

router.delete(
  "/history",
  authMiddleware,
  controller.deleteHistory.bind(controller)
);

router.post(
  "/regenerate",
  authMiddleware,
  controller.regenerate.bind(controller)
);

export default router;