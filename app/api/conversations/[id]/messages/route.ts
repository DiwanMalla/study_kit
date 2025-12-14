import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUBJECT_PROMPTS, MODE_INSTRUCTIONS } from "@/lib/conversation-utils";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST - Add message to conversation and get AI response
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Verify ownership and get conversation details
    const conversation = await db.conversation.findUnique({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10, // Last 5 exchanges
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Save user message
    const userMessage = await db.conversationMessage.create({
      data: {
        conversationId: id,
        role: "user",
        content: message,
      },
    });

    // Build AI prompt with context
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Get subject-specific prompt
    const subjectPrompt = conversation.subject
      ? SUBJECT_PROMPTS[conversation.subject.toLowerCase()] ||
        SUBJECT_PROMPTS.general
      : SUBJECT_PROMPTS.general;

    // Get mode-specific instructions
    const modeInstruction = MODE_INSTRUCTIONS[conversation.mode] || "";

    // Build conversation history
    const conversationHistory = conversation.messages
      .map((msg) => {
        const role = msg.role === "user" ? "Student" : "Assistant";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    const fullPrompt = `${subjectPrompt}

${modeInstruction}

${
  conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\n`
    : ""
}Student: ${message}

Please provide a helpful, clear response.`;

    console.log("Generating AI response for conversation:", id);

    // Stream the response
    const result = await model.generateContentStream(fullPrompt);

    const encoder = new TextEncoder();
    let fullResponse = "";
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            buffer += text;

            // Send in word-sized chunks for smoother streaming
            const words = buffer.split(/\s+/);
            if (words.length > 1) {
              const toSend = words.slice(0, -1).join(" ") + " ";
              buffer = words[words.length - 1];
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: toSend })}\n\n`)
              );
            }
          }

          // Send remaining buffer
          if (buffer) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: buffer })}\n\n`)
            );
          }

          // Save AI response after streaming is complete
          const aiMessage = await db.conversationMessage.create({
            data: {
              conversationId: id,
              role: "assistant",
              content: fullResponse,
            },
          });

          // Update conversation timestamp
          await db.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
          });

          // Send final message with saved data
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                userMessage,
                aiMessage,
              })}\n\n`
            )
          );

          controller.close();
          console.log("AI response generated and saved successfully");
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in conversation messages API:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
