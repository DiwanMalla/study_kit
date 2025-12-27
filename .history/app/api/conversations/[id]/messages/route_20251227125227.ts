import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUBJECT_PROMPTS, MODE_INSTRUCTIONS } from "@/lib/conversation-utils";
import { qwenImageGeneration } from "@/lib/ai";

type ChatProvider = "gemini" | "groq" | "openrouter" | "nvidia" | "qwen";

function parseSelectedModel(value: unknown): {
  provider: ChatProvider;
  modelId: string;
} {
  if (typeof value !== "string" || value.trim() === "") {
    return { provider: "gemini", modelId: "gemini-1.5-flash" };
  }

  let trimmed = value.trim();

  // Handle common aliases
  if (trimmed === "auto") trimmed = "groq:llama-3.3-70b-versatile";
  if (trimmed === "best") trimmed = "groq:llama-3.3-70b-versatile";
  if (trimmed === "fast") trimmed = "groq:llama-3.1-8b-instant";

  // Prefix-based parsing
  if (trimmed.startsWith("groq:")) {
    return {
      provider: "groq",
      modelId:
        trimmed.slice("groq:".length).trim() || "llama-3.3-70b-versatile",
    };
  }

  if (trimmed.startsWith("openrouter:") || trimmed.startsWith("or:")) {
    const prefix = trimmed.startsWith("openrouter:") ? "openrouter:" : "or:";
    return {
      provider: "openrouter",
      modelId: trimmed.slice(prefix.length).trim() || "openai/gpt-oss-20b:free",
    };
  }

  if (
    trimmed.startsWith("nvidia:") ||
    trimmed.includes("stabilityai/stable-diffusion")
  ) {
    return {
      provider: "nvidia",
      modelId:
        trimmed.replace("nvidia:", "").trim() ||
        "stabilityai/stable-diffusion-3.5-large",
    };
  }

  if (trimmed.startsWith("qwen-image")) {
    return { provider: "qwen", modelId: trimmed || "qwen-image-plus" };
  }

  if (trimmed.startsWith("openai:")) {
    return {
      provider: "openrouter",
      modelId: trimmed.slice("openai:".length).trim() || "openai/gpt-4o",
    };
  }

  if (trimmed.startsWith("gemini:")) {
    return {
      provider: "gemini",
      modelId: trimmed.slice("gemini:".length).trim() || "gemini-1.5-flash",
    };
  }

  // Handle models from ModelSelector that might not have prefixes
  if (
    trimmed.startsWith("llama-3") ||
    trimmed.startsWith("qwen") ||
    trimmed.includes("meta-llama/")
  ) {
    return { provider: "groq", modelId: trimmed };
  }

  if (trimmed.includes("/") || trimmed.includes("moonshotai/")) {
    return { provider: "openrouter", modelId: trimmed };
  }

  // Back-compat: unprefixed values are treated as Gemini model IDs.
  return { provider: "gemini", modelId: trimmed };
}

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
    const { message, model } = await req.json();
    let { provider, modelId } = parseSelectedModel(model);

    const lowerMessage = message?.trim().toLowerCase() || "";
    const imageTrigger =
      lowerMessage.startsWith("image:") ||
      lowerMessage.startsWith("/image") ||
      lowerMessage.startsWith("img:") ||
      lowerMessage.startsWith("generate image:") ||
      /\b(generate|genearte|create|make|draw|show|provide|give)\b.*\b(image|picture|photo|diagram|illustration|img)\b/i.test(
        lowerMessage
      ) ||
      /\b(image|picture|photo|diagram|illustration|img)\b.*\b(generate|genearte|create|make|draw|show|provide|give)\b/i.test(
        lowerMessage
      );

    if (imageTrigger && provider !== "qwen") {
      provider = "qwen";
      modelId = "qwen-image-plus";
    }

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

    const encoder = new TextEncoder();
    let fullResponse = "";
    let wordBuffer = "";

    const enqueueSmooth = (
      controller: ReadableStreamDefaultController,
      text: string
    ) => {
      wordBuffer += text;

      // Emit one "word" at a time (including the trailing whitespace), keeping
      // the last partial word in the buffer until we receive more text.
      // This yields a ChatGPT-like streaming feel.
      while (true) {
        const match = wordBuffer.match(/^(\s*\S+\s+)/);
        if (!match) break;

        const token = match[1];
        wordBuffer = wordBuffer.slice(token.length);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: token })}\n\n`)
        );
      }
    };

    const flushSmooth = (controller: ReadableStreamDefaultController) => {
      if (!wordBuffer) return;
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ text: wordBuffer })}\n\n`)
      );
      wordBuffer = "";
    };

    // Build request for OpenAI-compatible providers up-front
    let openAiCompatibleResponse: Response | null = null;

    // NVIDIA Image Generation Handling (Special Case)
    if (provider === "nvidia") {
      // We will handle this inside the stream to keep the UI responsive (loading state)
      // No pre-request needed here as we use our library function.
    } else if (provider === "qwen") {
      // Qwen image handled inside the stream; no pre-request
    } else if (provider === "groq") {
      if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
          { error: "GROQ_API_KEY is not set in environment variables" },
          { status: 500 }
        );
      }

      const systemPrompt = `${subjectPrompt}\n\n${modeInstruction}`.trim();
      const userPrompt = `${
        conversationHistory
          ? `Previous conversation:\n${conversationHistory}\n\n`
          : ""
      }Student: ${message}\n\nPlease provide a helpful, clear response.`;

      openAiCompatibleResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            stream: true,
            messages: [
              ...(systemPrompt
                ? [{ role: "system", content: systemPrompt }]
                : []),
              { role: "user", content: userPrompt },
            ],
          }),
        }
      );

      if (!openAiCompatibleResponse.ok) {
        const details = await openAiCompatibleResponse.text().catch(() => "");
        return NextResponse.json(
          {
            error: "Groq request failed",
            details: details || openAiCompatibleResponse.statusText,
          },
          { status: 500 }
        );
      }
    } else if (provider === "openrouter") {
      if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json(
          {
            error: "OPENROUTER_API_KEY is not set in environment variables",
          },
          { status: 500 }
        );
      }

      const systemPrompt = `${subjectPrompt}\n\n${modeInstruction}`.trim();
      const userPrompt = `${
        conversationHistory
          ? `Previous conversation:\n${conversationHistory}\n\n`
          : ""
      }Student: ${message}\n\nPlease provide a helpful, clear response.`;

      openAiCompatibleResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            model: modelId,
            stream: true,
            messages: [
              ...(systemPrompt
                ? [{ role: "system", content: systemPrompt }]
                : []),
              { role: "user", content: userPrompt },
            ],
          }),
        }
      );

      if (!openAiCompatibleResponse.ok) {
        const details = await openAiCompatibleResponse.text().catch(() => "");
        return NextResponse.json(
          {
            error: "OpenRouter request failed",
            details: details || openAiCompatibleResponse.statusText,
          },
          { status: 500 }
        );
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (provider === "gemini") {
            if (!process.env.GEMINI_API_KEY) {
              throw new Error(
                "GEMINI_API_KEY is not set in environment variables"
              );
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const geminiModel = genAI.getGenerativeModel({
              model: modelId || "gemini-1.5-flash",
            });

            const result = await geminiModel.generateContentStream(fullPrompt);

            for await (const chunk of result.stream) {
              const text = chunk.text();
              fullResponse += text;
              enqueueSmooth(controller, text);
            }

            flushSmooth(controller);
          } else if (provider === "qwen") {
            if (!process.env.ALIBABA_MODEL_API_KEY) {
              throw new Error("ALIBABA_MODEL_API_KEY is not set");
            }

            // Use Kimi K2 (both Groq and OpenRouter) as Image Prompt Compilers
            let optimizedPrompt = message;
            let groqPrompt = "";
            let openrouterPrompt = "";

            try {
              // First try to get context from previous messages
              const contextMessages = conversation.messages.slice(-4); // Last 4 messages for context
              const contextText = contextMessages
                .map(
                  (m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`
                )
                .join("\n");

              const systemPrompt = `You are an expert image prompt generator. Based on the conversation context, create a detailed, professional image prompt that:
1. Preserves the user's exact intent and requested style
2. Includes all specific details, labels, and requirements discussed
3. Follows the user's style preferences (medical diagram, blueprint, vector art, etc.)
4. Is optimized for high-quality image generation
5. Should be specific and detailed - at least 50 words

Output ONLY the enhanced prompt as plain text. No JSON, no markdown, no commentary. Just the prompt itself.`;

              const userMessage = `Based on this conversation:\n\n${contextText}\n\nThe user now wants: "${message}"\n\nGenerate a detailed, context-aware image prompt that captures all the important details from the conversation:`;

              // 1. Fetch from Groq using Kimi K2
              try {
                const groqResponse = await fetch(
                  "https://api.groq.com/openai/v1/chat/completions",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "moonshotai/kimi-k2-instruct-0905",
                      messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage },
                      ],
                      temperature: 0.7,
                      max_tokens: 1000,
                    }),
                  }
                );

                if (groqResponse.ok) {
                  const response = await groqResponse.json();
                  groqPrompt =
                    response?.choices?.[0]?.message?.content?.trim() || "";
                  if (groqPrompt && groqPrompt.length > 20) {
                    console.log("✓ Groq Kimi K2 Prompt:", groqPrompt);
                  }
                } else {
                  const errorText = await groqResponse.text();
                  console.error("Groq request failed:", errorText);
                }
              } catch (err) {
                console.error("Groq fetch error:", err);
              }

              // 2. Fetch from OpenRouter using Kimi K2
              try {
                const openrouterResponse = await fetch(
                  "https://openrouter.ai/api/v1/chat/completions",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                      "Content-Type": "application/json",
                      "HTTP-Referer":
                        process.env.OPENROUTER_SITE_URL ||
                        "http://localhost:3000",
                      "X-Title":
                        process.env.OPENROUTER_APP_NAME || "Super Student Kit",
                    },
                    body: JSON.stringify({
                      model: "or:moonshotai/kimi-k2-instruct-0711",
                      messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage },
                      ],
                      temperature: 0.7,
                      max_tokens: 1000,
                    }),
                  }
                );

                if (openrouterResponse.ok) {
                  const response = await openrouterResponse.json();
                  openrouterPrompt =
                    response?.choices?.[0]?.message?.content?.trim() || "";
                  if (openrouterPrompt && openrouterPrompt.length > 20) {
                    console.log(
                      "✓ OpenRouter Kimi K2 Prompt:",
                      openrouterPrompt
                    );
                  }
                } else {
                  const errorText = await openrouterResponse.text();
                  console.error("OpenRouter request failed:", errorText);
                }
              } catch (err) {
                console.error("OpenRouter fetch error:", err);
              }

              // Use the first successful prompt, prefer Groq if both work
              if (groqPrompt && groqPrompt.length > 20) {
                optimizedPrompt = groqPrompt;
              } else if (openrouterPrompt && openrouterPrompt.length > 20) {
                optimizedPrompt = openrouterPrompt;
              } else {
                throw new Error("Both Kimi K2 providers failed");
              }

              // Log both prompts for comparison
              console.log("\n=== IMAGE PROMPT COMPARISON ===");
              console.log("\nGroq Kimi K2 Prompt:");
              console.log(groqPrompt || "(Failed)");
              console.log("\nOpenRouter Kimi K2 Prompt:");
              console.log(openrouterPrompt || "(Failed)");
              console.log("\nUsing:", groqPrompt ? "Groq" : "OpenRouter");
              console.log("================================\n");
            } catch (err) {
              console.error(
                "Failed to optimize prompt with Kimi K2, using context fallback:",
                err
              );

              // Smarter fallback: extract meaningful context from conversation
              // Get all messages and find the most relevant content
              const allMessages = conversation.messages;

              // Try to find the last assistant response (which contains the main topic)
              let contextContent = "";
              for (let i = allMessages.length - 1; i >= 0; i--) {
                if (allMessages[i].role === "assistant") {
                  contextContent = allMessages[i].content;
                  break;
                }
              }

              // If we have good context, use it
              if (contextContent && contextContent.length > 50) {
                // Extract first 2-3 sentences as the main topic
                const sentences = contextContent.split(/(?<=[.!?])\s+/);
                optimizedPrompt = sentences.slice(0, 4).join(" ");

                // Ensure it's substantial
                if (optimizedPrompt.length < 30) {
                  optimizedPrompt = contextContent.substring(0, 300);
                }

                console.log(
                  "Using context from AI response - Prompt:",
                  optimizedPrompt.substring(0, 100)
                );
              } else {
                // Last resort: find any long user message that describes the topic
                for (let i = allMessages.length - 2; i >= 0; i--) {
                  if (
                    allMessages[i].role === "user" &&
                    allMessages[i].content.length > 50
                  ) {
                    optimizedPrompt = allMessages[i].content;
                    console.log(
                      "Using context from user message - Prompt:",
                      optimizedPrompt.substring(0, 100)
                    );
                    break;
                  }
                }
              }

              // If still no good prompt, use a generic message
              if (!optimizedPrompt || optimizedPrompt.length < 20) {
                optimizedPrompt = "Create a detailed, educational diagram";
              }
            }

            const imageUrl = await qwenImageGeneration(
              optimizedPrompt,
              modelId || "qwen-image-plus"
            );
            const markdown = `Here is the image you requested:\n\n![Generated Image](${imageUrl})\n\n*Prompt used: ${optimizedPrompt}*`;
            fullResponse = markdown;
            enqueueSmooth(controller, markdown);
            flushSmooth(controller);
          } else {
            // OpenAI-compatible streaming (Groq / OpenRouter)
            const body = openAiCompatibleResponse?.body;
            if (!body) {
              throw new Error("Streaming body missing");
            }

            const reader = body.getReader();
            const decoder = new TextDecoder();
            let sseBuffer = "";
            let done = false;

            while (!done) {
              const { value, done: readerDone } = await reader.read();
              if (readerDone) break;

              sseBuffer += decoder.decode(value, { stream: true });

              while (true) {
                const eventEndIndex = sseBuffer.indexOf("\n\n");
                if (eventEndIndex === -1) break;

                const rawEvent = sseBuffer.slice(0, eventEndIndex);
                sseBuffer = sseBuffer.slice(eventEndIndex + 2);

                for (const line of rawEvent.split("\n")) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;

                  const data = trimmed.slice("data:".length).trim();
                  if (data === "[DONE]") {
                    done = true;
                    break;
                  }

                  let payload: any;
                  try {
                    payload = JSON.parse(data);
                  } catch {
                    continue;
                  }

                  const delta = payload?.choices?.[0]?.delta?.content;
                  if (typeof delta === "string" && delta.length > 0) {
                    fullResponse += delta;
                    enqueueSmooth(controller, delta);
                  }
                }

                if (done) break;
              }
            }

            flushSmooth(controller);
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
        "X-Accel-Buffering": "no",
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
