import { z } from "zod";

export const sessionHistorySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const createMessageSchema = z.object({
  aiId: z.string().min(1),

  content: z
    .string()
    .min(1, "Message cannot be empty"),

  memory: z.boolean().optional(),

  sessionHistory: z
    .array(sessionHistorySchema)
    .optional(),
});

export type CreateMessageInput =
  z.infer<typeof createMessageSchema>;