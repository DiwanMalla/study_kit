import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateSummary } from "@/lib/ai";
import { extractContent } from "@/lib/gemini";
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

    const { sourceText, title, length, model, audience, fileId } = await req.json();

    let finalContent = sourceText?.trim() || "";

    // If fileId is provided, extract content from the file
    if (fileId) {
      const file = await db.file.findUnique({
        where: { id: fileId, userId },
        include: { extractedContent: true },
      });

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      let content = file.extractedContent?.content;

      if (!content) {
        // Fetch the file from the URL
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${file.name}`);
        }
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

      if (content) {
        finalContent = content;
      }
    }

    if (!finalContent || finalContent.length < 50) {
      return NextResponse.json(
        { error: "Content is too short or missing (minimum 50 characters)" },
        { status: 400 }
      );
    }

    // Generate summary using selected AI model
    const summaryData = await generateSummary(
      finalContent,
      model || "auto",
      (length as "short" | "medium" | "long") || "medium"
    );

    const { summary: summaryText, title: aiTitle, subject } = summaryData;

    // Generate title if not provided
    const finalTitle =
      title?.trim() || `${subject}: ${aiTitle}`;

    // Save to database
    const summary = await db.summary.create({
      data: {
        title: finalTitle,
        sourceText: finalContent,
        summaryText,
        userId,
        fileId: fileId || null,
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
