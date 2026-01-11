export type ModelType = string;

export interface ModelConfig {
  id: string;
  name: string;
  provider: "Groq" | "OpenRouter" | "ModelScope" | "NVIDIA" | "Alibaba";
  description?: string;
  isFree?: boolean;
  isNew?: boolean;
  category:
    | "all-rounder"
    | "fast"
    | "best"
    | "reasoning"
    | "coding"
    | "long-context"
    | "image";
}

export const AI_MODELS: ModelConfig[] = [
  // NVIDIA NIM Models
  {
    id: "stabilityai/stable-diffusion-3.5-large",
    name: "Stable Diffusion 3.5 Large",
    provider: "NVIDIA",
    description: "High-quality Image Generation (8B params)",
    category: "image",
  },

  // Groq Models
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    provider: "Groq",
    description: "Fastest response, good for simple tasks",
    category: "fast",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "Groq",
    description: "Balanced performance and intelligence",
    category: "all-rounder",
  },
  {
    id: "llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout",
    provider: "Groq",
    description: "Advanced reasoning capabilities",
    category: "reasoning",
  },
  {
    id: "llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick",
    provider: "Groq",
    description: "Best quality model",
    category: "best",
  },
  {
    id: "qwen-3-32b",
    name: "Qwen 3 32B",
    provider: "Groq",
    category: "reasoning",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "Groq",
    category: "reasoning",
  },
  {
    id: "gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "Groq",
    category: "reasoning",
  },
  {
    id: "kimi-k2-instruct",
    name: "Kimi K2",
    provider: "Groq",
    description: "Good for long context",
    category: "long-context",
  },

  // Alibaba Cloud Models
  {
    id: "qwen-max",
    name: "Qwen Max",
    provider: "Alibaba",
    description: "Alibaba's most powerful model",
    category: "best",
  },
  {
    id: "qwen-plus",
    name: "Qwen Plus",
    provider: "Alibaba",
    description: "Balanced performance and speed",
    category: "all-rounder",
  },
  {
    id: "qwen-image-plus",
    name: "Qwen Image Plus",
    provider: "Alibaba",
    description: "High-quality image generation",
    category: "image",
  },

  // OpenRouter Models (Latest Free tier)
  {
    id: "or:xiaomi/mimo-v2-flash:free",
    name: "MiMo-V2-Flash",
    provider: "OpenRouter",
    isFree: true,
    category: "fast",
    description:
      "Xiaomi MiMo-V2-Flash, 309B/15B hybrid, 256K context, top open-source model for reasoning/coding/agent tasks.",
  },
  {
    id: "or:mistralai/devstral-2-2512:free",
    name: "Devstral 2 2512",
    provider: "OpenRouter",
    isFree: true,
    category: "coding",
    description:
      "Mistral Devstral 2, 123B dense, 256K context, agentic coding, bug fixing, legacy modernization.",
  },
  {
    id: "or:tngtech/deepseek-r1t2-chimera:free",
    name: "DeepSeek R1T2 Chimera",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
    description:
      "TNG DeepSeek R1T2 Chimera, 671B MoE, 60K-130K context, strong reasoning, fast.",
  },
  {
    id: "or:kwaipilot/kat-coder-pro-v1:free",
    name: "KAT-Coder-Pro V1",
    provider: "OpenRouter",
    isFree: true,
    category: "coding",
    description:
      "KwaiKAT KAT-Coder-Pro V1, agentic coding, SWE-Bench 73.4%, tool-use, multi-turn, 256K context.",
  },
  {
    id: "or:tngtech/deepseek-r1t-chimera:free",
    name: "DeepSeek R1T Chimera",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
    description:
      "TNG DeepSeek R1T Chimera, MoE, reasoning, efficiency, instruction-following, 164K context.",
  },
  {
    id: "or:z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
    description:
      "Z.AI GLM 4.5 Air, lightweight MoE, hybrid inference, tool use, 131K context.",
  },
  {
    id: "or:qwen/qwen3-coder-480b-a35b-instruct:free",
    name: "Qwen3 Coder 480B A35B",
    provider: "OpenRouter",
    isFree: true,
    category: "coding",
    description:
      "Qwen3 Coder 480B A35B, MoE, code generation, function calling, 262K context.",
  },
  {
    id: "or:deepseek/r1-0528:free",
    name: "DeepSeek R1 0528",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
    description:
      "DeepSeek R1 0528, 671B/37B, open-source, open reasoning tokens, 164K context.",
  },
  {
    id: "or:nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B A3B",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
    description:
      "NVIDIA Nemotron 3 Nano 30B A3B, small MoE, 256K context, open weights/data, trial use.",
  },
];

export const MODEL_IDS = AI_MODELS.map((m) => m.id);

export const DEFAULT_MODEL_ID = "llama-3.3-70b-versatile";

export function getModelConfig(id: string): ModelConfig | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

// =============================================================================
// CENTRALIZED MODEL USAGE CONFIGURATION
// =============================================================================
// This section defines which models are used for specific roles in the app.
// =============================================================================

export type SubscriptionPlan = "free" | "pro" | "ultimate";

export interface AssignmentModelConfig {
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
}

export const MAX_FREE_IMAGES_PER_MONTH = 10;

/**
 * WHAT AI MODEL WE ARE USING (Main model for generation)
 * Currently using Alibaba's Qwen Max for best academic quality
 */
export const PREMIUM_ASSIGNMENT_MODEL: AssignmentModelConfig = {
  model: "qwen-max",
  provider: "Alibaba",
  temperature: 0.4,
  maxTokens: 4096,
};

export const FREE_ASSIGNMENT_MODEL: AssignmentModelConfig = {
  model: "llama-3.1-8b-instant",
  provider: "Groq",
  temperature: 0.4,
  maxTokens: 4096,
};

/**
 * WHAT AI MODEL WE USE AS A JUDGE (Model for evaluating responses)
 * Currently also using Qwen Max with low temperature for consistent judging
 */
export const JUDGE_MODEL: AssignmentModelConfig = {
  model: "qwen-max",
  provider: "Alibaba",
  temperature: 0.1,
  maxTokens: 4096,
};

/**
 * Helper to get the assignment model based on subscription
 */
export function getAssignmentModelForPlan(
  plan: SubscriptionPlan
): AssignmentModelConfig {
  if (plan === "pro" || plan === "ultimate") {
    return PREMIUM_ASSIGNMENT_MODEL;
  }
  return FREE_ASSIGNMENT_MODEL;
}

/**
 * Helper to get judge models
 */
export function getJudgeModels(
  plan: SubscriptionPlan
): AssignmentModelConfig[] {
  // Return premium models for Pro/Ultimate, only free model for Free
  if (plan === "pro" || plan === "ultimate") {
    return [PREMIUM_ASSIGNMENT_MODEL];
  }
  return [FREE_ASSIGNMENT_MODEL];
}

/**
 * Helper to get judge model for evaluation
 */
export function getJudgeModel(): AssignmentModelConfig {
  return JUDGE_MODEL;
}

/**
 * Subscription access checks
 */
export function hasPremiumAccess(plan: SubscriptionPlan): boolean {
  return plan === "pro" || plan === "ultimate";
}

export function hasUltimateAccess(plan: SubscriptionPlan): boolean {
  return plan === "ultimate";
}
