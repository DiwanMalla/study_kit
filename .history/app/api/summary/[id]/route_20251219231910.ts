import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const summary = await db.summary.findUnique({
      where: {
        id,
        userId: userId, // Ensure ownership
      },
    });

    if (!summary) {
      return new NextResponse("Summary not found", { status: 404 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[SUMMARY_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const summary = await db.summary.findUnique({
      where: {
        id,
        userId: userId,
      },
    });

    if (!summary) {
      return new NextResponse("Summary not found", { status: 404 });
    }

    await db.summary.delete({
      where: {
        id,
      },
    });

    return new NextResponse("Summary deleted", { status: 200 });
  } catch (error) {
    console.error("[SUMMARY_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
