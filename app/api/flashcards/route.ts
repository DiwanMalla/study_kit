import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateFlashcards } from "@/lib/ai";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { content, count, model } = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const flashcards = await generateFlashcards(content, count || 10, model || "auto");

    // Persist to database
    // 1. Create a "virtual" file for the text input
    const file = await db.file.create({
      data: {
        userId,
        name: `Flashcard Deck - ${new Date().toLocaleString()}`,
        url: "",
        type: "text",
        size: content.length,
        status: "ready",
      },
    });

    // 2. Store the original content
    await db.extractedContent.create({
      data: {
        fileId: file.id,
        content: content,
      },
    });

    // 3. Create the StudyKit
    const studyKit = await db.studyKit.create({
      data: {
        userId,
        fileId: file.id,
        title: file.name,
        status: "ready",
      },
    });

    // 4. Create Flashcard records
    if (flashcards.length > 0) {
        await db.flashcard.createMany({
            data: flashcards.map((card, index) => ({
                studyKitId: studyKit.id,
                question: card.question,
                answer: card.answer,
                order: index,
            })),
        });
    }

    return NextResponse.json({ flashcards, studyKitId: studyKit.id });
  } catch (error) {
    console.error("[FLASHCARDS_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
