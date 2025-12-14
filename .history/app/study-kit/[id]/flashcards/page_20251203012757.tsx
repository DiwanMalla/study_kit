import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FlashcardStudy } from "@/components/flashcard-study";

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const studyKit = await db.studyKit.findUnique({
    where: { id, userId },
    include: {
      flashcards: { orderBy: { order: "asc" } },
    },
  });

  if (!studyKit) notFound();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <FlashcardStudy 
        flashcards={studyKit.flashcards}
        studyKitId={id}
        studyKitTitle={studyKit.title}
      />
    </div>
  );
}
