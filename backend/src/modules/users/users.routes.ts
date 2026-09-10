import { Router } from "express";

import { authMiddleware } from "@/core/middleware/auth.middleware";
import { UsersController } from "./users.controller";

const router = Router();

const controller = new UsersController();

router.use(authMiddleware);

router.get(
  "/profile",
  controller.getProfile.bind(controller)
);

router.put(
  "/profile",
  controller.updateProfile.bind(controller)
);

router.put(
  "/change-password",
  controller.changePassword.bind(controller)
);

router.delete(
  "/",
  controller.deleteAccount.bind(controller)
);

export default router;