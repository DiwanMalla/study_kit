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

    const flashcard = await db.flashcard.update({
      where: {
        id,
        studyKit: {
          userId,
        },
      },
      data: {
        reviewed: !!reviewed,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("[FLASHCARD_REVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
