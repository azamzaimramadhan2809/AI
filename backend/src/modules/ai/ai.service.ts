import { AIRepository } from "./ai.repository";
import { UsersService } from "../users/users.service";
import { UpdateAIInput, createAISchema, updateAISchema } from "./ai.validation";

export class AIService {

  constructor(
    private readonly repository = new AIRepository(),
    private readonly usersService = new UsersService()
  ) {}

  // =========================
  // CREATE AI
  // =========================
  async createAI(
    userId: string,
    data: {
      name: string;
      description?: string;
      avatar?: string;
      category?: string;
      prompt?: string;
      personality?: string;
      model?: string;
      memory?: boolean;
      assistantType?: string;
    }
  ) {

    data = createAISchema.parse(data);

    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const totalAI =
      await this.repository.countByUserId(userId);

    if (totalAI >= 2) {
      throw new Error(
        "Maximum 2 AI allowed for now."
      );
    }

    return this.repository.create({
      userId,
      ...data,

      model:
        data.model || "default",

      memory:
        data.memory ?? true,

      assistantType:
        data.assistantType || "normal",
    });
  }


  // =========================
  // GET MY AIS
  // =========================
  async getMyAIs(
    userId: string
  ) {

    return this.repository.findByUserId(
      userId
    );
  }


  // =========================
  // GET AI BY ID
  // =========================
  async getAIById(
    id: string
  ) {

    const ai =
      await this.repository.findById(id);

    if (!ai) {
      throw new Error("AI not found");
    }

    return ai;
  }


  // =========================
  // GET MY AI
  // =========================
  async getMyAI(
    userId: string,
    aiId: string
  ) {

    const ai =
      await this.getAIById(aiId);

    if (ai.userId !== userId) {
      throw new Error("Forbidden");
    }

    return ai;
  }


  // =========================
  // UPDATE MY AI
  // =========================
  async updateAI(
    userId: string,
    id: string,
    data: UpdateAIInput
  ) {

    // 🔐 Ownership check
    await this.getMyAI(
      userId,
      id
    );

    return this.repository.update(
      id,
      updateAISchema.parse(data)
    );
  }


  // =========================
  // DELETE MY AI
  // =========================
  async deleteAI(
    userId: string,
    id: string
  ) {

    // 🔐 Ownership check
    await this.getMyAI(
      userId,
      id
    );

    return this.repository.delete(
      id
    );
  }
}
