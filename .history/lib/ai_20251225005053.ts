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

export type LegacyModelType = "auto" | "fast" | "best";
export type SummaryLength = "short" | "medium" | "long";

type GroqModelId =
  | "llama-3.1-8b-instant"
  | "llama-3.3-70b-versatile"
  | "meta-llama/llama-4-scout-17b-16e-instruct"
  | "meta-llama/llama-4-maverick-17b-128e-instruct"
  | "qwen/qwen3-32b"
  | "openai/gpt-oss-20b"
  | "openai/gpt-oss-120b"
  | "moonshotai/kimi-k2-instruct"
  | "moonshotai/kimi-k2-instruct-0905"
  | "groq/compound"
  | "groq/compound-mini";

export type ModelType = LegacyModelType | GroqModelId;

export type OpenRouterModelType = `or:${string}`;
export type AnyModelType = ModelType | OpenRouterModelType;

const DEFAULT_MODEL: GroqModelId = "llama-3.3-70b-versatile";

const MODEL_ALIASES: Record<string, GroqModelId> = {
  fast: "llama-3.1-8b-instant",
  best: "llama-3.3-70b-versatile",
  auto: DEFAULT_MODEL,
};

const GROQ_MODELS: Set<string> = new Set<string>([
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "qwen/qwen3-32b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct",
  "moonshotai/kimi-k2-instruct-0905",
  "groq/compound",
  "groq/compound-mini",
]);

function selectModel(type: AnyModelType): string {
  if (typeof type === "string" && isOpenRouterModel(type)) {
    return type;
  }

  const resolved = MODEL_ALIASES[type as string] ?? (type as string);
  return GROQ_MODELS.has(resolved) ? resolved : DEFAULT_MODEL;
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

  let typeInstructions = "";
  if (quizType === "true_false") {
    typeInstructions = `
- Create True/False questions.
- Each question should have exactly 2 options: ["True", "False"].
- Indicate the correct answer index (0 for True, 1 for False).`;
  } else if (quizType === "short_answer") {
    typeInstructions = `
- Create short answer questions.
- For "options", provide a single string representing the ideal concise answer.
- Set "correctAnswer" to 0.`;
  } else if (quizType === "fill_blanks") {
    typeInstructions = `
- Create fill-in-the-blank questions.
- Use "____" (four underscores) to represent the blank space in the question text.
- Provide 4 options that could fit the blank, with only one being correct.
- Indicate the correct answer index (0-3).`;
  } else {
    typeInstructions = `
- Create multiple choice questions.
- Each question should have 4 options.
- Indicate the correct answer index (0-3).`;
  }

  const prompt = `You are an expert study assistant. Create ${count} ${quizType.replace(
    "_",
    " "
  )} quiz questions from the following study material.
The difficulty level should be ${difficulty}.

Instructions:
- Create exactly ${count} questions
${typeInstructions}
- Provide a concise but meaningful explanation for the correct answer. It MUST be specific to the question and explain *why* the chosen answer is correct based on the study material. Avoid generic explanations.
- Return the response ONLY as a JSON array of objects
- Field names: "question", "options" (array of strings), "correctAnswer" (number), "explanation"
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
  modelType: AnyModelType = "auto"
): Promise<StudyMaterials> {
  // Run all generation in parallel for speed
  const [summaryData, flashcards, quizQuestions] = await Promise.all([
    generateSummary(content, modelType),
    generateFlashcards(content, 10, modelType),
    generateQuizQuestions(content, 5, modelType),
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
