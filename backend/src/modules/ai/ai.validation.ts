import { z } from "zod";

export const updateAISchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  description: z
    .string()
    .max(500)
    .optional(),

  avatar: z
    .string()
    .optional(),

  category: z
    .string()
    .max(100)
    .optional(),

  prompt: z
    .string()
    .max(10000)
    .optional(),

  personality: z
    .string()
    .max(500)
    .optional(),

  model: z
    .string()
    .max(100)
    .optional(),

  memory: z
    .boolean()
    .optional(),

  assistantType: z
    .string()
    .max(100)
    .optional(),

  isPinned: z
    .boolean()
    .optional(),
});

export type UpdateAIInput =
  z.infer<typeof updateAISchema>;