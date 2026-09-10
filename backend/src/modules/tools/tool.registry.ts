import { AITool } from "./tool.interface";

export class ToolRegistry {

  private readonly tools = new Map<string, AITool>();

  register(tool: AITool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  getAll(): AITool[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  remove(name: string): boolean {
    return this.tools.delete(name);
  }

  clear(): void {
    this.tools.clear();
  }
}