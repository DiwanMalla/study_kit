import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await db.exam.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EXAM_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[EXAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { score } = await req.json();

    const exam = await db.exam.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updatedExam = await db.exam.update({
      where: {
        id: params.id,
      },
      data: {
        score,
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("[EXAM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
