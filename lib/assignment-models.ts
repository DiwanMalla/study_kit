import { AI_MODELS } from "@/lib/ai-models";

export type SubscriptionPlan = "free" | "pro" | "ultimate";

export interface AssignmentModelConfig {
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Get the appropriate AI model based on user's subscription plan
 */
export function getAssignmentModelForPlan(
  plan: SubscriptionPlan
): AssignmentModelConfig {
  // Using Qwen Max from Alibaba directly as requested
  return {
    model: "qwen-max",
    provider: "Alibaba",
    temperature: 0.4,
    maxTokens: 4096,
  };
}

/**
 * Get multiple models for AI judge system (disabled for now)
 */
export function getJudgeModels(
  plan: SubscriptionPlan
): AssignmentModelConfig[] {
  // Return only one model to skip the judge comparison logic
  return [getAssignmentModelForPlan("free")];
}

/**
 * Get judge model for evaluating responses
 */
export function getJudgeModel(): AssignmentModelConfig {
  return {
    model: "qwen-max",
    provider: "Alibaba",
    temperature: 0.1,
    maxTokens: 4096,
  };
}

/**
 * Check if user has access to premium features
 */
export function hasPremiumAccess(plan: SubscriptionPlan): boolean {
  // For now, everyone has access to premium features
  return true;
}

/**
 * Check if user has access to ultimate features
 */
export function hasUltimateAccess(plan: SubscriptionPlan): boolean {
  // For now, everyone has access to ultimate features
  return true;
}
