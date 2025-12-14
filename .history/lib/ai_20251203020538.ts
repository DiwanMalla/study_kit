import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

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
export async function generateSummary(content: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert study assistant. Create a comprehensive but concise summary of the following study material.

Instructions:
- Highlight key concepts, definitions, and important points
- Use bullet points and clear headings for organization
- Make it easy to review before an exam
- Keep it under 1000 words
- Focus on the most important information

Content to summarize:
${content.slice(0, 30000)}

Summary:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Generate flashcards from content
 */
export async function generateFlashcards(
  content: string,
  count: number = 10
): Promise<GeneratedFlashcard[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert study assistant. Create ${count} flashcards from the following study material.

Instructions:
- Each flashcard should have a clear question and a concise answer
- Focus on key concepts, definitions, and important facts
- Questions should test understanding, not just memorization
- Answers should be brief but complete

Content:
${content.slice(0, 30000)}

Respond ONLY with a valid JSON array in this exact format, no other text:
[
  {"question": "What is X?", "answer": "X is..."},
  {"question": "Explain Y", "answer": "Y means..."}
]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing flashcards:", error);
    console.error("Raw response:", text);
    // Return a default flashcard if parsing fails
    return [
      {
        question: "What are the key topics in this material?",
        answer: "Please review the summary for the main topics covered.",
      },
    ];
  }
}

/**
 * Generate quiz questions from content
 */
export async function generateQuizQuestions(
  content: string,
  count: number = 5
): Promise<GeneratedQuizQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert study assistant. Create ${count} multiple choice quiz questions from the following study material.

Instructions:
- Each question should have 4 options (A, B, C, D)
- Only one option should be correct
- Include a brief explanation for the correct answer
- Questions should test understanding of key concepts
- Make incorrect options plausible but clearly wrong

Content:
${content.slice(0, 30000)}

Respond ONLY with a valid JSON array in this exact format, no other text:
[
  {
    "question": "What is the main concept of X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "The correct answer is A because..."
  }
]

Important: correctAnswer is the INDEX (0-3) of the correct option.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing quiz questions:", error);
    console.error("Raw response:", text);
    return [
      {
        question: "What is covered in this study material?",
        options: [
          "Key concepts and definitions",
          "Random information",
          "Nothing important",
          "Unrelated topics",
        ],
        correctAnswer: 0,
        explanation:
          "The material covers key concepts and definitions relevant to the topic.",
      },
    ];
  }
}

/**
 * Generate all study materials at once
 */
export async function generateStudyMaterials(
  content: string
): Promise<StudyMaterials> {
  // Run all generation in parallel for speed
  const [summary, flashcards, quizQuestions] = await Promise.all([
    generateSummary(content),
    generateFlashcards(content, 10),
    generateQuizQuestions(content, 5),
  ]);

  return {
    summary,
    flashcards,
    quizQuestions,
  };
}
