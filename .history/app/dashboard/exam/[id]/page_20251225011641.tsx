import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ExamTaker } from "./exam-taker";

export default async function ExamPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
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
    notFound();
  }

  return (
    <div className="w-full h-full bg-white dark:bg-[#1a190b] overflow-y-auto">
      <ExamTaker exam={exam} />
    </div>
  );
}
