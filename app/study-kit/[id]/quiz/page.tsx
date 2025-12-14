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

  const studyKit = await db.studyKit.findUnique({
    where: { id, userId },
    include: {
      quizzes: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!studyKit) notFound();

  // Get the first quiz (for MVP, we create one quiz per study kit)
  const quiz = studyKit.quizzes[0];
  const questions =
    quiz?.questions.map((q) => ({
      ...q,
      options: q.options as string[],
    })) || [];

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <QuizTaker
        questions={questions}
        studyKitId={id}
        studyKitTitle={studyKit.title}
        quizTitle={quiz?.title || "Practice Quiz"}
      />
    </div>
  );
}
