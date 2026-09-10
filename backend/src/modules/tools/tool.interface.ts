export interface ToolContext {
  userId: string;
  aiId: string;
}

export interface ToolInput {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolOutput {
  success: boolean;
  result: unknown;
}

export interface ToolParameterSchema {
  type: "object";

  properties: Record<
    string,
    {
      type: string;
      description?: string;
    }
  >;

  required?: string[];
}

export interface AITool {
  name: string;

  description: string;

  parameters?: ToolParameterSchema;

  execute(
    arguments_: Record<string, unknown>,
    context: ToolContext
  ): Promise<ToolOutput>;
}