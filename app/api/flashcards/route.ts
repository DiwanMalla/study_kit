import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateFlashcards } from "@/lib/ai";

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

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("[FLASHCARDS_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
