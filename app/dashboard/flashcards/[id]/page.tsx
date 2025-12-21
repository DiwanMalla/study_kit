import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FlashcardStudy } from "@/components/flashcard-study";

interface FlashcardsDeckPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function FlashcardsDeckPage({
  params,
}: FlashcardsDeckPageProps) {
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
    <FlashcardStudy
      flashcards={studyKit.flashcards}
      studyKitId={id}
      studyKitTitle={studyKit.title}
      backHref="/dashboard/flashcards"
    />
  );
}
