import { ImageProvider } from "./image-provider.interface";
import { MockImageProvider } from "./mock-image.provider";

export class ImageProviderFactory {

  static create(): ImageProvider {

    return new MockImageProvider();

  }

}