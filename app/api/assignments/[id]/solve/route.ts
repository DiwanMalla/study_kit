import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractContent } from "@/lib/gemini";
import { generateAssignmentSolutionWithJudge } from "@/lib/assignment-judge";
import {
  getAssignmentModelForPlan,
  getJudgeModels,
  hasPremiumAccess,
  hasUltimateAccess,
  MAX_FREE_IMAGES_PER_MONTH,
  SubscriptionPlan,
} from "@/lib/ai-models";
import { createAssignmentWordDocument } from "@/lib/word-generator";
import { qwenImageGeneration } from "@/lib/ai";
import { put } from "@vercel/blob";

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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

        // Fetch the file from the URL (guard against hanging requests)
        const response = await fetchWithTimeout(file.url, 30_000);
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
        const extracted = await withTimeout(
          extractContent(buffer, fileType, file.type),
          90_000,
          `Timed out extracting content for ${file.name}`
        );
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
      // Important: do not leave the assignment stuck in "processing".
      await db.assignment.update({
        where: { id },
        data: {
          status: "error",
          solution:
            "No content could be extracted from the uploaded files. Please add clearer text instructions or upload a different file format.",
        },
      });
      return new NextResponse(
        "No content to process. Please add files or description.",
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        subscriptionPlan: true,
        imageGenerationCount: true,
        lastImageReset: true,
      },
    });

    const plan = (user?.subscriptionPlan || "free") as SubscriptionPlan;
    const useJudge = hasPremiumAccess(plan);
    const models = getJudgeModels(plan);

    // Reset image counter if a new month has started
    let imageGenCount = user?.imageGenerationCount || 0;
    const lastReset = user?.lastImageReset || new Date();
    const now = new Date();
    const isNewMonth =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
      imageGenCount = 0;
      await db.user.update({
        where: { clerkId: userId },
        data: {
          imageGenerationCount: 0,
          lastImageReset: now,
        },
      });
    }

    // Generate solution with optional AI judge
    const result = await withTimeout(
      generateAssignmentSolutionWithJudge(
        assignment.title,
        assignment.description,
        combinedContent,
        useJudge,
        models
      ),
      180_000, // Increased timeout for judge system
      "Timed out generating assignment solution"
    );

    // Process images if needed
    let finalSolution = result.solution;
    const generatedImages: string[] = [];
    const diagramRegex = /\[(?:DIAGRAM|IMAGE):\s*([^\]]+)\]/gi;
    const matches = [...finalSolution.matchAll(diagramRegex)];

    if (matches.length > 0) {
      for (const match of matches) {
        const fullTag = match[0];
        const description = match[1];

        // Check image generation limit for free users
        if (!hasUltimateAccess(plan) && imageGenCount >= MAX_FREE_IMAGES_PER_MONTH) {
          console.log(`User ${userId} reached image generation limit`);
          // Just remove the tag if limit reached
          finalSolution = finalSolution.replace(fullTag, "");
          continue;
        }

        try {
          // Generate image using Qwen
          const imageUrl = await qwenImageGeneration(
            `Academic diagram for: ${description}. Professional, clear, educational style.`
          );

          // Download and upload to Vercel Blob
          const imgRes = await fetch(imageUrl);
          const imgBlob = await imgRes.blob();
          const { url: blobUrl } = await put(
            `assignments/${assignment.id}/diagram-${Date.now()}.png`,
            imgBlob,
            { access: "public" }
          );

          // Replace tag with markdown image
          finalSolution = finalSolution.replace(
            fullTag,
            `\n\n![${description}](${blobUrl})\n\n`
          );
          generatedImages.push(blobUrl);

          // Increment count
          imageGenCount++;
          await db.user.update({
            where: { clerkId: userId },
            data: { imageGenerationCount: { increment: 1 } },
          });
        } catch (error) {
          console.error(`Failed to generate image for: ${description}`, error);
          // Remove the tag if generation fails to keep it clean
          finalSolution = finalSolution.replace(fullTag, "");
        }
      }
    }

    // Generate Word document
    let wordDocUrl: string | null = null;
    try {
      wordDocUrl = await createAssignmentWordDocument(
        finalSolution,
        assignment.id,
        assignment.title
      );
    } catch (error) {
      console.error("Failed to generate Word document:", error);
      // Don't fail the whole process if Word generation fails
    }

    // Update assignment with solution and metadata
    await db.assignment.update({
      where: { id },
      data: {
        status: "completed",
        solution: finalSolution,
        modelUsed: result.modelUsed,
        images: generatedImages,
        judgeScore: result.judgeResult
          ? result.judgeResult.scores.find((s) => s.model === result.modelUsed)
              ?.score
          : null,
        wordDocUrl,
      },
    });

    return NextResponse.json({ success: true, solution: finalSolution });
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
