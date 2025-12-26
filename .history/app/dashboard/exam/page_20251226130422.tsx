import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ExamList } from "./exam-list";
import { redirect } from "next/navigation";

export default async function ExamPrepPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
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
        select: { id: true },
      },
    },
  });

  return (
    <div className="w-full h-full bg-card overflow-y-auto p-6 md:p-10 flex justify-center">
      <div className="w-full">
        <ExamList initialExams={exams} />
      </div>
    </div>
  );
}
