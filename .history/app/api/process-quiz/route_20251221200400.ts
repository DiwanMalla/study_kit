import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractContent } from "@/lib/gemini";
import { generateQuizQuestions } from "@/lib/ai";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { fileId, model, count, title, subject, difficulty, type } = await request.json();

    if (!fileId) {
      return new NextResponse("File ID is required", { status: 400 });
    }

    // Get the file
    const file = await db.file.findUnique({
      where: { id: fileId, userId },
      include: { extractedContent: true },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Update file status to processing
    await db.file.update({
      where: { id: fileId },
      data: { status: "processing" },
    });

    // Extract content if not already extracted
    let content = file.extractedContent?.content;

    if (!content) {
      // Fetch the file from the URL
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine file type
      let fileType = "pdf";
      if (file.type.includes("presentation") || file.name.endsWith(".pptx")) {
        fileType = "pptx";
      } else if (file.type.startsWith("image/")) {
        fileType = "image";
      }

      // Extract content
      const extracted = await extractContent(buffer, fileType, file.type);
      content = extracted.content;

      // Save extracted content
      await db.extractedContent.upsert({
        where: { fileId: file.id },
        update: {
          content: content,
          metadata: extracted.metadata as any,
        },
        create: {
          fileId: file.id,
          content: content,
          metadata: extracted.metadata as any,
        },
      });
    }

    // Create study kit
    const studyKit = await db.studyKit.create({
      data: {
        userId,
        fileId: file.id,
        title: title || file.name.replace(/\.[^/.]+$/, ""), // Use provided title or file name
        status: "processing",
      },
    });

    // Generate quiz questions
    const questions = await generateQuizQuestions(content, count || 10, model || "auto");

    // Create quiz
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
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: index,
        })),
      });
    }

    // Update study kit status
    await db.studyKit.update({
      where: { id: studyKit.id },
      data: {
        status: "ready",
      },
    });

    // Update file status
    await db.file.update({
      where: { id: fileId },
      data: { status: "ready" },
    });

    return NextResponse.json({
      success: true,
      studyKitId: studyKit.id,
      id: quizId,
    });
  } catch (error) {
    console.error("Error processing file for quiz:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
