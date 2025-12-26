import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    const { examId, content, count, type, model } = values;

    const exam = await db.exam.findUnique({
      where: { id: examId, userId },
    });

    if (!exam) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    // Update status to generating
    await db.exam.update({
      where: { id: examId },
      data: { status: "generating" },
    });

    // Generate questions using AI
    let questions: any[] = [];
    
    // Determine types to generate
    const typesToGenerate = values.types && values.types.length > 0 ? values.types : [type || "mcq"];
    const totalCount = count || 10;
    
    // Distribute count evenly
    const baseCount = Math.floor(totalCount / typesToGenerate.length);
    let remainingCount = totalCount % typesToGenerate.length;

    const generationPromises = typesToGenerate.map((qType: string) => {
      // Add one to the count if we have remainder to distribute
      const typeCount = baseCount + (remainingCount > 0 ? 1 : 0);
      remainingCount = Math.max(0, remainingCount - 1);
      
      if (typeCount <= 0) return Promise.resolve([]);

      return generateQuizQuestions(
        content,
        typeCount,
        model || "auto",
        qType,
        exam.difficulty
      );
    });

    const results = await Promise.all(generationPromises);
    questions = results.flat();

    // Save questions to DB
    // Use createMany for efficiency and to avoid transaction timeouts
    await db.examQuestion.createMany({
      data: questions.map((q, index) => ({
        examId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        type: q.type || "mcq", // Use the type from the generated question
        order: index,
      })),
    });

    // Update status to ready
    const updatedExam = await db.exam.update({
      where: { id: examId },
      data: { status: "ready" },
      include: { questions: true },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("[EXAMS_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
