import { Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

const knownErrors: Record<string, number> = {
  "Forbidden": 403,
  "AI not found": 404,
  "User not found": 404,
  "Message not found": 404,
  "User message not found": 404,
  "Invalid email or password": 401,
  "Email already exists": 409,
  "Username already exists": 409,
  "Maximum 2 AI allowed for now.": 409,
  "Only assistant messages can be regenerated": 400,
  "Old password is incorrect": 400,
};

export function apiErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return { status: 400, body: { success: false, message: "Invalid request", issues: error.issues.map(issue => ({
      path: issue.path.map(String).join("."), message: issue.message,
    })) } };
  }
  if (error instanceof ApiError) return { status: error.status, body: { success: false, message: error.message } };
  if (error instanceof Error && Object.hasOwn(knownErrors, error.message)) {
    return { status: knownErrors[error.message], body: { success: false, message: error.message } };
  }
  const metadata = error as { code?: string; type?: string } | null;
  if (metadata?.type === "entity.parse.failed") return { status: 400, body: { success: false, message: "Invalid JSON body" } };
  if (metadata?.type === "entity.too.large") return { status: 413, body: { success: false, message: "Request body too large" } };
  if (metadata?.code === "P2002") return { status: 409, body: { success: false, message: "Resource already exists" } };
  if (metadata?.code === "P2025") return { status: 404, body: { success: false, message: "Resource not found" } };
  return { status: 500, body: { success: false, message: "Internal Server Error" } };
}

export function sendApiError(res: Response, error: unknown) {
  const { status, body } = apiErrorResponse(error);
  if (res.destroyed || res.writableEnded) return;
  if (res.headersSent) {
    res.write(`event: error\ndata: ${JSON.stringify(body)}\n\n`);
    res.end();
    return;
  }
  return res.status(status).json(body);
}

// Provider details can contain credentials, request payloads, or internal URLs.
export function providerError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const details = error as { status?: number; name?: string; cause?: { code?: string } } | null;
  if (details?.status === 429) return new ApiError(429, "AI rate limit exceeded. Please try again later.");
  if (details?.status === 503) return new ApiError(503, "AI service temporarily unavailable. Please try again later.");
  if (details?.status === 504 || details?.status === 408 || ["TimeoutError", "AbortError"].includes(details?.name ?? "") || details?.cause?.code === "ETIMEDOUT") {
    return new ApiError(504, "AI request timed out. Please try again.");
  }
  return new ApiError(502, "AI service failed to complete the response.");
}
