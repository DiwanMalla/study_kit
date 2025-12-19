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

// Initialize Gemini for fallback or specific use cases if needed
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type ModelType = "auto" | "fast" | "best";
export type SummaryLength = "short" | "medium" | "long";

function selectModel(type: ModelType): string {
  switch (type) {
    case "fast":
      return "llama-3.1-8b-instant";
    case "best":
      return "llama-3.3-70b-versatile";
    case "auto":
    default:
      // Default to the stronger model for auto
      return "llama-3.3-70b-versatile";
  }
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
  modelType: ModelType = "auto",
  length: SummaryLength = "medium"
): Promise<string> {
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

  const prompt = `You are an expert study assistant. Create a ${length} summary of the following study material.

Instructions:
${lengthInstructions}
- Highlight key concepts, definitions, and important points
- Use Markdown headings with # and ## (not plain text titles)
- Use '-' for bullet lists (not inline sentences)
- Add blank lines between sections for readability
- Keep paragraphs short (2-4 lines)
- Format the response as clean Markdown only (no extra preface)

Study Material:
${content.slice(0, 30000)} // Limit content to avoid token limits if super large
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful and expert study assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelName,
      temperature: 0.5,
      max_tokens: 2048,
    });

    return (
      completion.choices[0]?.message?.content || "Failed to generate summary."
    );
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
  modelType: ModelType = "auto"
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
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant that outputs JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelName,
      temperature: 0.2, // Lower temp for structured output
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

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
  modelType: ModelType = "auto"
): Promise<GeneratedQuizQuestion[]> {
  const modelName = selectModel(modelType);

  const prompt = `You are an expert study assistant. Create ${count} multiple choice quiz questions from the following study material.

Instructions:
- Create exactly ${count} questions
- Each question should have 4 options
- Indicate the correct answer index (0-3)
- Provide a brief explanation for the correct answer
- Return the response ONLY as a JSON array of objects
- Field names: "question", "options" (array of strings), "correctAnswer" (number), "explanation"
- Do not include any markdown formatting or code blocks outside the JSON

Study Material:
${content.slice(0, 30000)}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant that outputs JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelName,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

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
  modelType: ModelType = "auto"
): Promise<StudyMaterials> {
  // Run all generation in parallel for speed
  const [summary, flashcards, quizQuestions] = await Promise.all([
    generateSummary(content, modelType),
    generateFlashcards(content, 10, modelType),
    generateQuizQuestions(content, 5, modelType),
  ]);

  return {
    summary,
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
 - Format the response in Markdown
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
