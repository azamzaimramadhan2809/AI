import { Router } from "express";
import aiRoutes from "@/modules/ai/ai.routes";
import authRoutes from "@/modules/auth/auth.routes";
import imageRoutes from "@/modules/image/image.route";
import usersRoutes from "@/modules/users/users.routes";

const router = Router();

router.get("/", (_, res) => {
  res.json({
    status: "online",
    message: "Jarvis Backend API",
    version: "1.0.0",
  });
});

router.get("/health", (_, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

router.use("/ai", aiRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/image", imageRoutes);

export default router;