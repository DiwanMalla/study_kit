import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractContent } from "@/lib/gemini";
import { generateAssignmentSolution } from "@/lib/ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const assignment = await db.assignment.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        files: {
          include: {
            extractedContent: true,
          },
        },
      },
    });

    if (!assignment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Update status to processing
    await db.assignment.update({
      where: { id },
      data: { status: "processing", solution: null },
    });

    let combinedContent = "";

    // Extract content from all files
    for (const file of assignment.files) {
      // Prefer cached extracted text when available
      let content = file.extractedContent?.content;

      if (!content) {
        // Update file status to processing (best-effort)
        await db.file.update({
          where: { id: file.id },
          data: { status: "processing" },
        });

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

        // Persist extracted text so future solves don't reprocess the same file
        await db.extractedContent.upsert({
          where: { fileId: file.id },
          update: {
            content,
            metadata: extracted.metadata,
          },
          create: {
            fileId: file.id,
            content,
            metadata: extracted.metadata,
          },
        });

        // Mark file as ready (best-effort)
        await db.file.update({
          where: { id: file.id },
          data: { status: "ready" },
        });
      }

      if (content) {
        combinedContent += `\n--- File: ${file.name} ---\n${content}\n`;
      }
    }

    // If the user provided only text input (no files), treat that text as content too.
    if (!combinedContent.trim() && assignment.description) {
      combinedContent = assignment.description;
    }

    if (!combinedContent.trim() && !assignment.description) {
      return new NextResponse(
        "No content to process. Please add files or description.",
        { status: 400 }
      );
    }

    // Generate solution
    const solution = await generateAssignmentSolution(
      assignment.title,
      assignment.description,
      combinedContent
    );

    // Update assignment with solution
    await db.assignment.update({
      where: { id },
      data: {
        status: "completed",
        solution: solution,
      },
    });

    return NextResponse.json({ success: true, solution });
  } catch (error) {
    console.error("[ASSIGNMENT_SOLVE]", error);

    // Attempt to update status to error
    try {
      const { id } = await params;
      await db.assignment.update({
        where: { id },
        data: { status: "error" },
      });
    } catch (e) {
      console.error("Failed to update status to error", e);
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
