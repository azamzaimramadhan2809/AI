import { ImageProviderFactory } from "./providers/image-provider.factory";

export class ImageService {

  private provider =
    ImageProviderFactory.create();

  async generate(
    prompt: string
  ) {

    if (!prompt.trim()) {
      throw new Error(
        "Image prompt is required"
      );
    }

    const result =
      await this.provider.generate({
        prompt,
      });

    return result;
  }
}