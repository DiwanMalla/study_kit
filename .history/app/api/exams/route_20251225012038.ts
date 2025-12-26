import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    const { title, subject, model, difficulty, duration } = values;

    const exam = await db.exam.create({
      data: {
        userId,
        title,
        subject,
        difficulty: difficulty || "medium",
        duration: duration || 30,
        status: "draft",
        // We can store the model preference in a separate field or just pass it to generation
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[EXAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exams = await db.exam.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        questions: {
          select: { id: true }, // Count questions
        },
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("[EXAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
