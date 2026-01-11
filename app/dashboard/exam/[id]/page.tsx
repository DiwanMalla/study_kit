import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ExamTaker } from "./exam-taker";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/");
  }

  const exam = await db.exam.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
      },
      attempts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Transform questions.options from JsonValue to string[]
  const examForComponent = {
    ...exam,
    questions: exam.questions.map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      type: q.type ?? "mcq",
    })),
    attempts: Array.isArray(exam.attempts)
      ? exam.attempts.map((a: any) => ({
          ...a,
          answers: Array.isArray(a.answers) ? a.answers : [],
        }))
      : [],
  };

  return (
    <div className="w-full h-full bg-background overflow-y-auto">
      <div className="max-w-[1920px] mx-auto">
        <ExamTaker exam={examForComponent} />
      </div>
    </div>
  );
}
