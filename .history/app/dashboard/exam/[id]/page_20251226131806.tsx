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
    },
  });

  if (!exam) {
    notFound();
  }

  return (
    <div className="w-full h-full bg-background overflow-y-auto">
      <ExamTaker exam={exam} />
    </div>
  );
}
