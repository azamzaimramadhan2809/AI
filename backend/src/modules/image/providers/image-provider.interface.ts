import {
  ImageGenerationInput,
  ImageGenerationOutput,
} from "./image-provider.types";

export interface ImageProvider {

  generate(
    input: ImageGenerationInput
  ): Promise<ImageGenerationOutput>;

}