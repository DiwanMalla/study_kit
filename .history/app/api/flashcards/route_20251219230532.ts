import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateFlashcards } from "@/lib/ai";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const decks = await db.studyKit.findMany({
      where: {
        userId,
        flashcards: { some: {} },
      },
      include: {
        _count: { select: { flashcards: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error("[FLASHCARDS_GET_ALL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Ensure user exists in database (required for FK constraints)
    const user = await currentUser();
    const email =
      user?.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`;
    await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Student",
      },
      create: {
        clerkId: userId,
        email,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Student",
      },
    });

    const { content, count, model } = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const flashcards = await generateFlashcards(
      content,
      count || 10,
      model || "auto"
    );

    const title = content.split(" ").slice(0, 5).join(" ") + "...";

    // Persist to database
    // 1. Create a "virtual" file for the text input
    const file = await db.file.create({
      data: {
        userId,
        name: `Flashcards - ${title}`,
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

    return NextResponse.json({
      flashcards,
      studyKitId: studyKit.id,
      title: studyKit.title,
    });
  } catch (error) {
    console.error("[FLASHCARDS_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
