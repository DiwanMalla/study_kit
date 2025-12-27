export type ModelType = string;

export interface ModelConfig {
  id: string;
  name: string;
  provider: "Groq" | "OpenRouter" | "ModelScope" | "NVIDIA";
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
    name: "Llama 3.3 70B Versatile",
    provider: "Groq",
    description: "Balanced performance and intelligence",
    category: "all-rounder",
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout",
    provider: "Groq",
    description: "Advanced reasoning capabilities",
    category: "reasoning",
  },
  {
    id: "meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick",
    provider: "Groq",
    description: "Best quality model",
    category: "best",
  },
  {
    id: "qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: "Groq",
    category: "reasoning",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "Groq",
    category: "reasoning",
  },
  {
    id: "moonshotai/kimi-k2-instruct-0905",
    name: "Kimi K2 (Groq)",
    provider: "Groq",
    description: "Good for long context",
    category: "long-context",
  },

  // OpenRouter Models (Free tier)
  {
    id: "or:mistralai/devstral-2-2512",
    name: "Devstral 2 2512",
    provider: "OpenRouter",
    isFree: true,
    category: "coding",
  },
  {
    id: "or:kwaipilot/kat-coder-pro-v1",
    name: "KAT-Coder-Pro V1",
    provider: "OpenRouter",
    isFree: true,
    category: "coding",
  },
  {
    id: "or:tngtech/deepseek-r1t2-chimera",
    name: "DeepSeek R1T2 Chimera",
    provider: "OpenRouter",
    isFree: true,
    category: "reasoning",
  },
  {
    id: "or:xiaomi/mimo-v2-flash",
    name: "MiMo-V2-Flash",
    provider: "OpenRouter",
    isFree: true,
    category: "fast",
  },
  {
    id: "or:google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "OpenRouter",
    isFree: true,
    category: "fast",
  },
  {
    id: "or:moonshotai/kimi-k2-instruct-0711",
    name: "Kimi K2 0711 (OpenRouter Free)",
    provider: "OpenRouter",
    description: "Free tier, 128K token context",
    isFree: true,
    category: "long-context",
  },
];

export const MODEL_IDS = AI_MODELS.map((m) => m.id);

export const DEFAULT_MODEL_ID = "llama-3.3-70b-versatile";

export function getModelConfig(id: string): ModelConfig | undefined {
  return AI_MODELS.find((m) => m.id === id);
}
