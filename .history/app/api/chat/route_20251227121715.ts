import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use Gemini 1.5 Flash - same model used successfully in lib/gemini.ts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation context
    let prompt = `You are a helpful AI study assistant. You help students with their questions, provide explanations, and support their learning journey. Be concise, clear, and encouraging.

User question: ${message}`;

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      const context = conversationHistory
        .map((msg: { role: string; content: string }) => {
          return `${msg.role === "user" ? "Student" : "Assistant"}: ${
            msg.content
          }`;
        })
        .join("\n");
      prompt = `Previous conversation:\n${context}\n\n${prompt}`;
    }

    console.log("Generating AI response for user:", userId);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI response generated successfully");

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
