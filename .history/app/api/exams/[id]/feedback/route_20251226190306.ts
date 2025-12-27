import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

type AnswerValue = number | string;
const normalizeAnswer = (value: string) => value.trim().toLowerCase();
const isShortAnswerQuestion = (type: unknown) =>
  type === "short_answer" || type === "short_essay";

function normalizeOpenRouterModelId(model: string): string {
  return model.replace(/^or:/, "");
}

function isInvalidOpenRouterModelError(
  status: number,
  bodyText: string
): boolean {
  if (status !== 400) return false;
  return bodyText.toLowerCase().includes("not a valid model id");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new NextResponse("OPENROUTER_API_KEY is not set on the server", {
        status: 500,
      });
    }

    const exam = await db.exam.findFirst({
      where: { id, userId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const body = (await req.json()) as {
      score?: number;
      timeSpentSeconds?: number;
      answers?: Array<[number, AnswerValue]>;
    };

    const answersMap = new Map<number, AnswerValue>(
      Array.isArray(body.answers) ? body.answers : []
    );

    const missed = exam.questions
      .map((q, idx) => {
        const userAnswer = answersMap.get(idx);
        const isAnswered = userAnswer !== undefined;

        const options = Array.isArray(q.options) ? q.options : [];
        const correctText =
          options?.[q.correctAnswer] !== undefined
            ? String(options[q.correctAnswer])
            : null;

        const isCorrect = (() => {
          if (!isAnswered) return false;
          if (typeof userAnswer === "number")
            return userAnswer === q.correctAnswer;
          if (typeof userAnswer === "string" && isShortAnswerQuestion(q.type)) {
            return (
              correctText !== null &&
              normalizeAnswer(userAnswer) === normalizeAnswer(correctText)
            );
          }
          return false;
        })();

        return {
          index: idx + 1,
          type: q.type || "mcq",
          question: q.question,
          userAnswerText: !isAnswered
            ? null
            : typeof userAnswer === "number"
            ? options?.[userAnswer] !== undefined
              ? String(options[userAnswer])
              : null
            : typeof userAnswer === "string"
            ? userAnswer
            : null,
          correctAnswerText: correctText,
          explanation: q.explanation,
          status: !isAnswered ? "unanswered" : isCorrect ? "correct" : "wrong",
        };
      })
      .filter((x) => x.status !== "correct");

    // A commonly-available free OpenRouter model
    const fallbackModel = "meta-llama/llama-3.1-8b-instruct:free";
    const requestedModelRaw =
      process.env.OPENROUTER_EXAM_FEEDBACK_MODEL || fallbackModel;
    const requestedModel = normalizeOpenRouterModelId(requestedModelRaw);

    const prompt = `You are an expert tutor. Provide personalized exam feedback.

Exam title: ${exam.title}
Subject: ${exam.subject || "General"}
Score: ${typeof body.score === "number" ? body.score : exam.score ?? "N/A"}%
Time spent (seconds): ${
      typeof body.timeSpentSeconds === "number" ? body.timeSpentSeconds : "N/A"
    }

The student needs:
1) A short diagnosis of what went wrong (patterns)
2) 3-5 specific focus areas (concept names)
3) A 7-day study plan (bullets)
4) Practice suggestions: 8-12 targeted tasks/questions

Incorrect/unanswered questions (with correct answers):
${JSON.stringify(missed.slice(0, 25), null, 2)}

Write in a clear, motivating tone. No markdown headers; use short bullet points where helpful.`;

    const requestOnce = async (model: string) => {
      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME || "Super Student Kit",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful tutor. Return plain text only, concise and actionable.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 900,
        }),
      });

      return res;
    };

    let res = await requestOnce(requestedModel);
    if (!res.ok) {
      const text = await res.text();

      // If the configured model is invalid, retry once with a safe fallback.
      if (
        requestedModel !== fallbackModel &&
        isInvalidOpenRouterModelError(res.status, text)
      ) {
        res = await requestOnce(fallbackModel);
        if (!res.ok) {
          const retryText = await res.text();
          return new NextResponse(
            `OpenRouter error (${res.status}): ${retryText}`,
            { status: 502 }
          );
        }
      } else {
        return new NextResponse(`OpenRouter error (${res.status}): ${text}`, {
          status: 502,
        });
      }
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const feedback =
      json.choices?.[0]?.message?.content?.trim() || "No feedback returned.";

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("[EXAM_FEEDBACK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
