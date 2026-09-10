import { AIProvider } from "./provider.interface";
import { GrokProvider } from "./grok.provider";
import { GeminiProvider } from "./gemini.provider";

export class ProviderFactory {
  static create(): AIProvider {
    return new GeminiProvider();
    // return new GrokProvider();
  }
}