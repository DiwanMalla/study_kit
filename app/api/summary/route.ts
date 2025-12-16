import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateSummary } from "@/lib/ai";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { content, model } = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const summary = await generateSummary(content, model || "auto");

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[SUMMARY_GENERATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
