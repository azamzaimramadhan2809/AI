import { z } from "zod";
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const registerSchema = loginSchema.extend({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(64),
  displayName: z.string().max(100).optional(),
});
export const profileSchema = z.object({
  username: z.string().trim().min(1).max(100).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  avatar: z.string().optional(),
});
export const passwordSchema = z.object({
  oldPassword: z.string().min(1), newPassword: z.string().min(8).max(64), confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, { path: ["confirmPassword"], message: "Confirm password does not match" })
  .refine(data => data.oldPassword !== data.newPassword, { path: ["newPassword"], message: "New password must be different from old password" });
