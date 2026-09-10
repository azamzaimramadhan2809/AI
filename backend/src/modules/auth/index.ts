import { Router } from "express";

import authRoutes from "@/modules/auth/auth.routes";

const router = Router();

router.get("/health", (_, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

router.use("/auth", authRoutes);

export default router;