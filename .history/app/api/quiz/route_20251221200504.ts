import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateQuizQuestions } from "@/lib/ai";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { content, count, model, title, subject } = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const questions = await generateQuizQuestions(
      content,
      count || 5,
      model || "auto"
    );

    // Persist to database
    // 1. Create a "virtual" file
    const file = await db.file.create({
      data: {
        userId,
        name: title || `AI Quiz - ${new Date().toLocaleString()}`,
        url: "",
        type: "text",
        size: content.length,
        status: "ready",
      },
    });

    // 2. Store content
    await db.extractedContent.create({
      data: {
        fileId: file.id,
        content: content,
      },
    });

    // 3. Create StudyKit
    const studyKit = await db.studyKit.create({
      data: {
        userId,
        fileId: file.id,
        title: file.name,
        status: "ready",
      },
    });

    // 4. Create Quiz & Questions
    let quizId = "";
    if (questions.length > 0) {
      const quiz = await db.quiz.create({
        data: {
          studyKitId: studyKit.id,
          title: title || "Generated Quiz",
          subject: subject || "Psychology",
        },
      });
      quizId = quiz.id;

      await db.quizQuestion.createMany({
        data: questions.map((q, index) => ({
          quizId: quiz.id,
          question: q.question,
          options: q.options, // Ensure your schema supports Json or string[]
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: index,
        })),
      });
    }

    return NextResponse.json({
      questions,
      studyKitId: studyKit.id,
      id: quizId,
    });
  } catch (error) {
    console.error("[QUIZ_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
