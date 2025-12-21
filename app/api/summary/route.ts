import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateSummary } from "@/lib/ai";
import { db } from "@/lib/db";

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

    const { content, model, length, audience, fileId } = await request.json();

    if (!content && !fileId) {
      return new NextResponse("Content or File is required", { status: 400 });
    }

    const summaryData = await generateSummary(content, model || "auto", length || "medium");
    const { summary: summaryText, title: aiTitle, subject } = summaryData;

    // Generate a title using AI suggestion if available
    const finalTitle = `${subject}: ${aiTitle}`;

    // Persist to database using the new Summary model
    const summary = await db.summary.create({
      data: {
        userId,
        title: finalTitle,
        sourceText: content || "",
        summaryText: summaryText,
        fileId: fileId || null,
      },
    });

    return NextResponse.json({ summaryId: summary.id, summary: summaryText });
  } catch (error) {
    console.error("[SUMMARY_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Ensure user exists in database (safe no-op if already present)
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

    const summaries = await db.summary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("[SUMMARY_GET_ALL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
