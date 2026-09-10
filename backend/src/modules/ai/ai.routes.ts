import { Router } from "express";

import { AIController } from "./ai.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";

const router = Router();

const controller = new AIController();

router.use(authMiddleware);

router.post("/", controller.create.bind(controller));

router.get("/", controller.getAll.bind(controller));

router.get("/:id", controller.getById.bind(controller));

router.put("/:id", controller.update.bind(controller));

router.delete("/:id", controller.delete.bind(controller));

/**
 * Test AI
 */
router.post("/test", controller.test.bind(controller));

export default router;