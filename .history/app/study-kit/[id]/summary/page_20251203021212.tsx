import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import { SummaryContent } from "@/components/summary-content";

interface SummaryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const studyKit = await db.studyKit.findUnique({
    where: { id, userId },
  });

  if (!studyKit) notFound();

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/study-kit/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {studyKit.title}
          </h1>
          <p className="text-muted-foreground">Summary</p>
        </div>
      </div>

      {/* Summary Content with Markdown Viewer */}
      <SummaryContent 
        summary={studyKit.summary || ""} 
        title={studyKit.title} 
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/study-kit/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Study Kit
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/study-kit/${id}/flashcards`}>
            <Brain className="h-4 w-4 mr-2" />
            Study Flashcards
          </Link>
        </Button>
      </div>
    </div>
  );
}
