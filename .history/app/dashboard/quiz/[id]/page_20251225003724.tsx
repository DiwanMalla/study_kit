import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { QuizTaker } from "@/components/quiz-taker";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id },
    include: {
      studyKit: true,
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!quiz || quiz.studyKit.userId !== userId) notFound();

  const questions = quiz.questions.map((q) => ({
    ...q,
    options: q.options as string[],
  }));

  return (
    <div className="h-full">
      <QuizTaker
        questions={questions}
        studyKitId={quiz.studyKitId}
        studyKitTitle={quiz.studyKit.title}
        quizTitle={quiz.title}
      />
    </div>
  );
}
