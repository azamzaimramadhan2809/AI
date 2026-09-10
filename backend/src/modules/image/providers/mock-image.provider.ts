import {
  ImageGenerationInput,
  ImageGenerationOutput,
} from "./image-provider.types";

import { ImageProvider } from "./image-provider.interface";

export class MockImageProvider implements ImageProvider {

  async generate(
    input: ImageGenerationInput
  ): Promise<ImageGenerationOutput> {

    return {
      imageUrl:
        "https://example.com/mock-image.png",

      revisedPrompt:
        input.prompt,

      metadata: {
        provider: "mock",
        status: "mock",
      },
    };
  }
}