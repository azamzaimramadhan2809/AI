import {
  ToolContext,
  ToolInput,
  ToolOutput,
} from "./tool.interface";

import { ToolRegistry } from "./tool.registry";

export class ToolExecutor {

  constructor(
    private readonly registry = new ToolRegistry()
  ) {}

  async execute(
    input: ToolInput,
    context: ToolContext
  ): Promise<ToolOutput> {

    console.log(
      "🔧 TOOL CALLED:",
      input.name,
      input.arguments
    );

    const tool =
      this.registry.get(input.name);

    if (!tool) {
      return {
        success: false,
        result:
          `Tool "${input.name}" not found.`,
      };
    }

    try {

      const result =
        await tool.execute(
          input.arguments,
          context
        );

      return result;

    } catch (error) {

      console.error(
        `Tool execution failed: ${input.name}`,
        error
      );

      return {
        success: false,

        result:
          error instanceof Error
            ? `Tool "${input.name}" failed: ${error.message}`
            : `Tool "${input.name}" failed.`,
      };
    }
  }
}