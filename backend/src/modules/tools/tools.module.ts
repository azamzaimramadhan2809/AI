import { FunctionDeclaration } from "@google/genai";

import { ToolRegistry } from "./tool.registry";
import { TimeTool } from "./tool.time";
import { CalculatorTool } from "./tool.calculator";
import { createToolDefinition } from "./tool.definition";

export const toolRegistry =
  new ToolRegistry();

toolRegistry.register(
  new TimeTool()
);

toolRegistry.register(
  new CalculatorTool()
);

export function getToolDefinitions(): FunctionDeclaration[] {
  return toolRegistry
    .getAll()
    .map(createToolDefinition);
}