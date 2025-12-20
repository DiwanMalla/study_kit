import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateSummary } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    const { sourceText, title, length } = await req.json();

    // Validate input
    if (!sourceText || typeof sourceText !== "string") {
      return NextResponse.json(
        { error: "Source text is required" },
        { status: 400 }
      );
    }

    const trimmedText = sourceText.trim();
    if (trimmedText.length < 50) {
      return NextResponse.json(
        { error: "Content must be at least 50 characters long" },
        { status: 400 }
      );
    }

    // Generate summary using best AI model (Llama 3.3 70B via Groq)
    const summaryText = await generateSummary(
      trimmedText,
      "auto", // Use best model automatically
      length as "short" | "medium" | "long"
    );

    // Generate title if not provided
    const finalTitle =
      title?.trim() ||
      `Summary of "${trimmedText.substring(0, 50).trim()}...".`;

    // Save to database
    const summary = await db.summary.create({
      data: {
        title: finalTitle,
        sourceText: trimmedText,
        summaryText,
        userId,
        length: (length as "short" | "medium" | "long") || "medium",
      },
    });

    return NextResponse.json(
      {
        id: summary.id,
        title: summary.title,
        message: "Summary generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Get pagination params
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get("skip") || "0", 10);
    const take = Math.min(
      parseInt(url.searchParams.get("take") || "10", 10),
      50
    );

    // Fetch summaries for user
    const [summaries, total] = await Promise.all([
      db.summary.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          summaryText: true,
          sourceText: true,
          length: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      db.summary.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      summaries,
      total,
      skip,
      take,
      hasMore: skip + take < total,
    });
  } catch (error) {
    console.error("Get summaries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}
