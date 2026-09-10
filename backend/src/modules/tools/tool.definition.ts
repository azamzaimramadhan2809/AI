import { FunctionDeclaration } from "@google/genai";

import { AITool } from "./tool.interface";

export function createToolDefinition(
  tool: AITool
): FunctionDeclaration {

  return {
    name: tool.name,

    description: tool.description,

    parametersJsonSchema:
      tool.parameters ?? {
        type: "object",
        properties: {},
      },
  };
}