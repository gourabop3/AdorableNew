import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export type ModelKey =
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-exp"
  | "openrouter:deepseek/deepseek-r1-distill-llama-70b:free";

export const DEFAULT_MODEL: ModelKey = "gemini-2.5-pro";

export function getModelByKey(key: string | undefined | null): LanguageModelV1 {
  const modelKey = (key as ModelKey) || DEFAULT_MODEL;

  if (modelKey.startsWith("gemini-")) {
    return google(modelKey);
  }

  if (modelKey.startsWith("openrouter:")) {
    const modelId = modelKey.replace("openrouter:", "");
    return openrouter(modelId);
  }

  // Fallback to default
  return google(DEFAULT_MODEL);
}

export const AVAILABLE_MODELS: { key: ModelKey; label: string }[] = [
  { key: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { key: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Exp)" },
  {
    key: "openrouter:deepseek/deepseek-r1-distill-llama-70b:free",
    label: "DeepSeek R1 Distill 70B (Free via OpenRouter)",
  },
];