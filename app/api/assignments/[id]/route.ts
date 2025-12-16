import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
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
        files: true,
      },
    });

    if (!assignment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
