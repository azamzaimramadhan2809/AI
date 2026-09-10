export interface ImageGenerationInput {
  prompt: string;
}

export interface ImageGenerationOutput {
  imageUrl: string;
  revisedPrompt?: string;
  metadata?: Record<string, unknown>;
}