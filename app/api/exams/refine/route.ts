import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { refineText } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, model } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const refinedContent = await refineText(content, model || "auto");

    return NextResponse.json({ result: refinedContent });
  } catch (error) {
    console.error("[EXAMS_REFINE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
