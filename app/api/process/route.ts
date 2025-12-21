import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractContent } from "@/lib/gemini";
import { generateStudyMaterials } from "@/lib/ai";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { fileId, model } = await request.json();

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
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        status: "processing",
      },
    });

    // Generate study materials
    const materials = await generateStudyMaterials(content, model || "auto");

    // Update study kit with summary
    await db.studyKit.update({
      where: { id: studyKit.id },
      data: {
        summary: materials.summary,
        status: "ready",
      },
    });

    // Create flashcards
    if (materials.flashcards.length > 0) {
      await db.flashcard.createMany({
        data: materials.flashcards.map((fc, index) => ({
          studyKitId: studyKit.id,
          question: fc.question,
          answer: fc.answer,
          order: index,
        })),
      });
    }

    // Create quiz with questions
    if (materials.quizQuestions.length > 0) {
      const quiz = await db.quiz.create({
        data: {
          studyKitId: studyKit.id,
          title: `${studyKit.title} Quiz`,
        },
      });

      await db.quizQuestion.createMany({
        data: materials.quizQuestions.map((q, index) => ({
          quizId: quiz.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: index,
        })),
      });
    }

    // Update file status
    await db.file.update({
      where: { id: fileId },
      data: { status: "ready" },
    });

    return NextResponse.json({
      success: true,
      studyKitId: studyKit.id,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
