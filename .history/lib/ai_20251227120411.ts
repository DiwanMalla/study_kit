// import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

if (!process.env.GEMINI_API_KEY) {
  // This check is for Gemini, which is still imported but not the primary generation engine.
  // If Gemini is completely removed, this check can be removed.
  console.warn(
    "GEMINI_API_KEY is not set in environment variables. Gemini functionality might be limited."
  );
}

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables");
}

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function isOpenRouterModel(model: string): boolean {
  return model.startsWith("or:");
}

function normalizeOpenRouterModel(model: string): string {
  return model.replace(/^or:/, "");
}

// Initialize Gemini for fallback or specific use cases if needed
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

import { DEFAULT_MODEL_ID, AI_MODELS } from "@/lib/ai-models";

export type LegacyModelType = "auto" | "fast" | "best";
export type SummaryLength = "short" | "medium" | "long";

export type ModelType = string;
export type OpenRouterModelType = `or:${string}`;
export type AnyModelType = ModelType | OpenRouterModelType;

const DEFAULT_MODEL = DEFAULT_MODEL_ID;

const MODEL_ALIASES: Record<string, string> = {
  fast: "llama-3.1-8b-instant",
  best: "llama-3.3-70b-versatile",
  auto: DEFAULT_MODEL,
};

const GROQ_MODELS = new Set(
  AI_MODELS.filter((m) => m.provider === "Groq").map((m) => m.id)
);

function selectModel(type: AnyModelType): string {
  if (typeof type === "string" && isOpenRouterModel(type)) {
    return type;
  }

  const resolved = MODEL_ALIASES[type as string] ?? (type as string);
  // Allow passing any configured model ID, even if not explicitly in the old Set
  // Just fallback to default if it's completely unknown and not an OR model
  const config = AI_MODELS.find((m) => m.id === resolved);
  return config ? config.id : DEFAULT_MODEL;
}

async function openRouterChatCompletion(args: {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: any;
}): Promise<any> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set in environment variables (required for OpenRouter models)"
    );
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      // Optional but recommended by OpenRouter for attribution:
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Super Student Kit",
    },
    body: JSON.stringify({
      model: normalizeOpenRouterModel(args.model),
      messages: args.messages,
      temperature: args.temperature,
      max_tokens: args.max_tokens,
      response_format: args.response_format,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${text}`);
  }

  return res.json();
}

function isNvidiaModel(model: string): boolean {
  // Check against known NVIDIA models or a specific prefix if we add one in ai-models.ts
  const nvidiaModels = AI_MODELS.filter((m) => m.provider === "NVIDIA").map(
    (m) => m.id
  );
  return nvidiaModels.includes(model);
}

async function nvidiaChatCompletion(args: {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: any;
}): Promise<any> {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set in environment variables");
  }

  const res = await fetch(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: args.temperature,
        max_tokens: args.max_tokens,
        response_format: args.response_format,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NVIDIA request failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Generate an image using NVIDIA NIM
 * Using Stability AI Stable Diffusion 3.5 Large via NVIDIA
 */
export async function nvidiaImageGeneration(
  prompt: string,
  model: string = "stabilityai/stable-diffusion-3.5-large"
): Promise<string> {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set");
  }

  // The endpoint specific to SD 3.5 Large on NVIDIA NIM might differ,
  // but typically follows OpenAI image generation format or specific invoke format.
  // Based on NVIDIA NIM docs, it's often /v1/images/generations or an invoke endpoint.
  // For SD 3.5, let's assume standard OpenAI-compatible format if available, or the specific invoke URL.
  // Since it's a "standard" NIM, we often use the https://integrate.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-5-large
  // But standard chat/completions URL pattern suggests: https://integrate.api.nvidia.com/v1/images/generations
  // checking documentation is not possible but "integrate.api.nvidia.com" is standard for hosted NIMs.
  // Standard Payload for SD 3.5 on NIM usually involves:
  // { "text_prompts": [{"text": "prompt", "weight": 1}], "cfg_scale": 5, "sampler": "K_EULER_ANCESTRAL", "seed": 0, "steps": 25 }
  // OR OpenAI format: { "prompt": "...", "n": 1, "size": "1024x1024" }

  // Let's try the specific invoke endpoint for SD 3.5 Large if we can, or the OpenAI compatible one.
  // Safest bet for "integrate.api.nvidia.com" is the model-specific URL.

  const url =
    "https://integrate.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 5,
      sampler: "K_EULER_ANCESTRAL",
      seed: 0,
      steps: 25,
      height: 1024,
      width: 1024,
    }),
  });

  if (!response.ok) {
    // Try standard OpenAI format if the specific one fails?
    // Or maybe the URL is different.
    // Let's return error for now to debug.
    const err = await response.text();
    throw new Error(`NVIDIA Image Generation Failed: ${err}`);
  }

  const data = await response.json();
  // Response format for Stability on NIM usually: { artifacts: [{ base64: "..." }] }
  if (data.artifacts && data.artifacts.length > 0) {
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }

  throw new Error("No image data returned from NVIDIA");
}

// Qwen Image (Alibaba DashScope) generation
export async function qwenImageGeneration(
  prompt: string,
  model: string = "qwen-image-plus",
  options: { size?: string; promptExtend?: boolean; watermark?: boolean } = {}
): Promise<string> {
  if (!process.env.ALIBABA_MODEL_API_KEY) {
    throw new Error("ALIBABA_MODEL_API_KEY is not set");
  }

  const response = await fetch(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ALIBABA_MODEL_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [
            {
              role: "user",
              content: [{ text: prompt }],
            },
          ],
        },
        parameters: {
          negative_prompt: "",
          prompt_extend: options.promptExtend ?? true,
          watermark: options.watermark ?? false,
          size: options.size ?? "1328*1328",
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Qwen image request failed (${response.status})`);
  }

  const data = await response.json();
  const imageUrl = data?.output?.choices?.[0]?.message?.content?.[0]?.image;
  if (!imageUrl) {
    throw new Error("Qwen image URL missing in response");
  }
  return imageUrl;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type?: string;
}

export interface StudyMaterials {
  summary: string;
  flashcards: GeneratedFlashcard[];
  quizQuestions: GeneratedQuizQuestion[];
}

/**
 * Generate a comprehensive summary from content
 */
export async function generateSummary(
  content: string,
  modelType: AnyModelType = "auto",
  length: SummaryLength = "medium"
): Promise<{ summary: string; title: string; subject: string }> {
  const modelName = selectModel(modelType);

  // Customize instructions based on length
  let lengthInstructions = "";
  switch (length) {
    case "short":
      lengthInstructions = `- Keep the summary BRIEF and CONCISE (approximately 3-5 bullet points)
- Focus ONLY on the most critical concepts and takeaways
- Aim for 100-150 words maximum`;
      break;
    case "long":
      lengthInstructions = `- Create a DETAILED and COMPREHENSIVE summary
- Include in-depth explanations of key concepts
- Cover all important points with supporting details
- Aim for 400-600 words with thorough coverage`;
      break;
    case "medium":
    default:
      lengthInstructions = `- Create a BALANCED summary covering main concepts
- Include key points with moderate detail
- Aim for 200-300 words`;
  }

  const prompt = `You are an expert study assistant. Create a ${length} summary of the provided study material.
  
Return your response in EXACTLY this JSON format:
{
  "summary": "The detailed markdown summary...",
  "title": "A short, professional title for the summary",
  "subject": "The primary academic subject (e.g. Mathematics, Physics, History, Biology)"
}

Instructions for the 'summary' field:
${lengthInstructions}
- Use Markdown headings with # and ##
- Use '-' for bullet lists
- Highlight key definitions and important points
- Return ONLY the JSON object.

Study Material:
${content.slice(0, 30000)}
`;

  try {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are a helpful and expert study assistant that always responds in JSON format.",
      },
      { role: "user" as const, content: prompt },
    ];

    let responseText = "";

    if (isOpenRouterModel(modelName)) {
      const completion = await openRouterChatCompletion({
        model: modelName,
        messages,
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });
      responseText = completion.choices?.[0]?.message?.content || "";
    } else if (isNvidiaModel(modelName)) {
      const completion = await nvidiaChatCompletion({
        model: modelName,
        messages,
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });
      responseText = completion.choices?.[0]?.message?.content || "";
    } else {
      const completion = await groq.chat.completions.create({
        messages,
        model: modelName,
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });
      responseText = completion.choices[0]?.message?.content || "";
    }

    if (!responseText) {
      throw new Error("No response from AI");
    }

    try {
      // Find JSON content even if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;

      const parsed = JSON.parse(jsonString);
      return {
        summary: parsed.summary || responseText,
        title: parsed.title || "Untitled Summary",
        subject: parsed.subject || "General",
      };
    } catch (e) {
      console.error("Failed to parse AI summary JSON:", responseText);
      return {
        summary: responseText, // Fallback to raw text
        title: "Untitled Summary",
        subject: "General",
      };
    }
  } catch (error) {
    console.error("Groq Summary Generation Error:", error);
    throw new Error("Failed to generate summary");
  }
}

/**
 * Generate flashcards from content
 */
export async function generateFlashcards(
  content: string,
  count: number = 10,
  modelType: AnyModelType = "auto"
): Promise<GeneratedFlashcard[]> {
  const modelName = selectModel(modelType);

  const prompt = `You are an expert study assistant. Create ${count} flashcards from the following study material.

Instructions:
- Create exactly ${count} flashcards
- Each flashcard should have a clear Question and a concise Answer
- Focus on testing understanding of key concepts
- Return the response ONLY as a JSON array of objects with "question" and "answer" fields
- Do not include any markdown formatting or code blocks outside the JSON
- Example format: [{"question": "What is...", "answer": "It is..."}]

Study Material:
${content.slice(0, 30000)}
`;

  try {
    const messages = [
      {
        role: "system" as const,
        content: "You are a helpful study assistant that outputs JSON.",
      },
      { role: "user" as const, content: prompt },
    ];

    const completion = isOpenRouterModel(modelName)
      ? await openRouterChatCompletion({
          model: modelName,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        })
      : isNvidiaModel(modelName)
      ? await nvidiaChatCompletion({
          model: modelName,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        })
      : await groq.chat.completions.create({
          messages,
          model: modelName,
          temperature: 0.2,
          response_format: { type: "json_object" },
        });

    const responseText = completion.choices?.[0]?.message?.content || "[]";

    // Parse JSON
    try {
      // Handle potential wrapping in "flashcards" key or direct array
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
        return parsed.flashcards;
      } else {
        // Try to find array in keys
        const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
        if (key) return parsed[key];
        return [];
      }
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return [];
    }
  } catch (error) {
    console.error("Groq Flashcard Generation Error:", error);
    throw new Error("Failed to generate flashcards");
  }
}

/**
 * Generate quiz questions from content
 */
export async function generateQuizQuestions(
  content: string,
  count: number = 5,
  modelType: AnyModelType = "auto",
  quizType: string = "mcq",
  difficulty: string = "medium"
): Promise<GeneratedQuizQuestion[]> {
  const modelName = selectModel(modelType);

  const prompt = `You are an expert study assistant. Create ${count} ${quizType.replace(
    "_",
    " "
  )} quiz questions from the following study material.
The difficulty level should be ${difficulty}.

CRITICAL INSTRUCTIONS FOR QUIZ TYPE "${quizType}":
${
  quizType === "fill_blanks"
    ? '- This MUST be a fill-in-the-blank quiz.\n- You MUST include "____" (at least four underscores) in the question text where the blank should be.\n- Provide 4 options that could fit the blank, with only one being correct.'
    : quizType === "true_false"
    ? '- This MUST be a True/False quiz.\n- Each question MUST have exactly 2 options: ["True", "False"].\n- Indicate the correct answer index (0 for True, 1 for False).'
    : quizType === "short_answer"
    ? '- This MUST be a short answer quiz.\n- For "options", provide a single string representing the ideal concise answer.\n- Set "correctAnswer" to 0.'
    : "- This MUST be a multiple choice quiz.\n- Each question MUST have 4 options.\n- Indicate the correct answer index (0-3)."
}

General Instructions:
- Create exactly ${count} questions
- Provide a concise but meaningful explanation for the correct answer. It MUST be specific to the question and explain *why* the chosen answer is correct based on the study material. Avoid generic explanations.
- Return the response as a JSON object with a "questions" key containing the array of questions.
- Field names for each question: "question", "options" (array of strings), "correctAnswer" (number), "explanation", "type" (set this to "${quizType}")
- Do not include any markdown formatting or code blocks outside the JSON

Study Material:
${content.slice(0, 30000)}
`;

  try {
    const messages = [
      {
        role: "system" as const,
        content: "You are a helpful study assistant that outputs JSON.",
      },
      { role: "user" as const, content: prompt },
    ];

    const completion = isOpenRouterModel(modelName)
      ? await openRouterChatCompletion({
          model: modelName,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        })
      : isNvidiaModel(modelName)
      ? await nvidiaChatCompletion({
          model: modelName,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        })
      : await groq.chat.completions.create({
          messages,
          model: modelName,
          temperature: 0.2,
          response_format: { type: "json_object" },
        });

    const responseText = completion.choices?.[0]?.message?.content || "[]";

    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      } else {
        const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
        if (key) return parsed[key];
        return [];
      }
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return [];
    }
  } catch (error) {
    console.error("Groq Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

/**
 * Generate all study materials at once
 */
export async function generateStudyMaterials(
  content: string,
  modelType: AnyModelType = "auto",
  quizType: string = "mcq",
  difficulty: string = "medium"
): Promise<StudyMaterials> {
  // Run all generation in parallel for speed
  const [summaryData, flashcards, quizQuestions] = await Promise.all([
    generateSummary(content, modelType),
    generateFlashcards(content, 10, modelType),
    generateQuizQuestions(content, 5, modelType, quizType, difficulty),
  ]);

  return {
    summary: summaryData.summary,
    flashcards,
    quizQuestions,
  };
}

/**
 * Generate a solution for an assignment
 */
export async function generateAssignmentSolution(
  title: string,
  description: string | null,
  fileContent: string,
  modelType: ModelType = "auto"
): Promise<string> {
  const modelName = selectModel(modelType);

  const prompt = `You are an expert academic tutor. specific assignment details and user instructions are provided below.
 Please provide a comprehensive solution and explanation.
 
 Assignment Title: ${title}
 
 File Content:
 ${fileContent.slice(0, 30000)}
 
 Instructions:
 - Solve the assignment step-by-step
 - Explain your reasoning clearly
 - If code is required, provide clean, commented code
 - Provide at least 3-5 academic references or sources used for the solution
 - Format the response in Markdown with clear headings: # Solution, # Explanation, and # References
 `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic tutor.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelName,
      temperature: 0.4,
    });

    return (
      completion.choices[0]?.message?.content || "Failed to generate solution."
    );
  } catch (error) {
    console.error("Groq Assignment Solution Error:", error);
    throw new Error("Failed to generate solution");
  }
}

/**
 * Refine and expand study notes
 */
export async function refineText(
  content: string,
  modelType: ModelType = "auto"
): Promise<string> {
  const modelName = selectModel(modelType);

  const prompt = `You are an expert academic editor. Improve the following study notes to be more structured, detailed, and suitable for generating exam questions.
  
  Instructions:
  - Organize the text with clear headings and bullet points
  - Fix any grammar or spelling errors
  - Expand on brief concepts with accurate definitions and context
  - Ensure the content is factually accurate and academic
  - Maintain the original meaning but enhance clarity and depth
  
  Original Text:
  ${content.slice(0, 10000)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic editor.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelName,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "Failed to refine text.";
  } catch (error) {
    console.error("Groq Text Refinement Error:", error);
    throw new Error("Failed to refine text");
  }
}
