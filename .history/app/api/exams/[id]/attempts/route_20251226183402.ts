import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type AnswersPayload = Array<[number, number]>;

function isAnswersPayload(value: unknown): value is AnswersPayload {
  if (!Array.isArray(value)) return false;
  return value.every(
    (entry) =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      Number.isInteger(entry[0]) &&
      Number.isInteger(entry[1])
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: examId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as {
      answers?: unknown;
      timeSpentSeconds?: unknown;
    };

    if (!isAnswersPayload(body.answers)) {
      return new NextResponse("Invalid answers payload", { status: 400 });
    }

    const timeSpentSeconds =
      typeof body.timeSpentSeconds === "number" &&
      Number.isFinite(body.timeSpentSeconds)
        ? Math.max(0, Math.floor(body.timeSpentSeconds))
        : null;

    const exam = await db.exam.findFirst({
      where: {
        id: examId,
        userId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const answersMap = new Map<number, number>();
    for (const [questionIndex, optionIndex] of body.answers) {
      if (questionIndex < 0 || questionIndex >= exam.questions.length) continue;
      if (optionIndex < 0) continue;
      answersMap.set(questionIndex, optionIndex);
    }

    let correct = 0;
    for (const [questionIndex, optionIndex] of answersMap.entries()) {
      const q = exam.questions[questionIndex];
      if (q && optionIndex === q.correctAnswer) correct += 1;
    }

    const score = Math.round((correct / exam.questions.length) * 100);

    const attempt = await db.examAttempt.create({
      data: {
        examId: exam.id,
        userId,
        answers: Array.from(answersMap.entries()),
        score,
        timeSpentSeconds,
      },
    });

    await db.exam.update({
      where: { id: exam.id },
      data: {
        status: "completed",
        score,
      },
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("[EXAM_ATTEMPT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
