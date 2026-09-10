import { z } from "zod";

export const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Image prompt is required")
    .max(4000, "Image prompt is too long"),
});

export type GenerateImageInput =
  z.infer<typeof generateImageSchema>;