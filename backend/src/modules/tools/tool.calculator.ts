import {
  AITool,
  ToolContext,
  ToolOutput,
} from "./tool.interface";

export class CalculatorTool implements AITool {
  name = "calculator";

  description =
    "Calculate basic mathematical expressions such as addition, subtraction, multiplication, and division.";

  parameters = {
    type: "object" as const,

    properties: {
      expression: {
        type: "string",
        description:
          "The mathematical expression to calculate, for example 125 * 48.",
      },
    },

    required: ["expression"],
  };

  async execute(
    arguments_: Record<string, unknown>,
    _context: ToolContext
  ): Promise<ToolOutput> {

    const expression =
      arguments_.expression;

    if (typeof expression !== "string") {
      return {
        success: false,
        result:
          "The calculator requires a mathematical expression.",
      };
    }

    const sanitized =
      expression
        .replace(/\s+/g, "")
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    if (
      !/^[0-9+\-*/().]+$/.test(
        sanitized
      )
    ) {
      return {
        success: false,
        result:
          "Invalid mathematical expression.",
      };
    }

    try {
      const result =
        Function(
          `"use strict"; return (${sanitized})`
        )();

      if (
        typeof result !== "number" ||
        !Number.isFinite(result)
      ) {
        return {
          success: false,
          result:
            "The calculation did not produce a valid number.",
        };
      }

      return {
        success: true,
        result,
      };

    } catch {
      return {
        success: false,
        result:
          "Failed to calculate the expression.",
      };
    }
  }
}