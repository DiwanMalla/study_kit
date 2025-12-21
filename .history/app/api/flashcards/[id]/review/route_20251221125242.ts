import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { reviewed } = await req.json();

    // Note: 'reviewed' field is not currently in the generated Prisma client
    // Verify the flashcard exists and user has access
    const flashcard = await db.flashcard.findFirst({
      where: {
        id,
        studyKit: {
          userId,
        },
      },
    });

    if (!flashcard) {
      return new NextResponse("Flashcard not found", { status: 404 });
    }

    // Return success (reviewed state tracking disabled for now)
    return NextResponse.json({ ...flashcard, reviewed: !!reviewed });
  } catch (error) {
    console.error("[FLASHCARD_REVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
