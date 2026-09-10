import {
  AITool,
  ToolContext,
  ToolOutput,
} from "./tool.interface";

export class TimeTool implements AITool {
  name = "get_time";

  description =
    "Get the current date and time.";

  parameters = {
    type: "object" as const,

    properties: {},
  };

  async execute(
    _arguments: Record<string, unknown>,
    _context: ToolContext
  ): Promise<ToolOutput> {

    const now = new Date();

    return {
      success: true,

      result: {
        iso: now.toISOString(),

        timestamp:
          now.getTime(),
      },
    };
  }
}