import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

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
          <h1 className="text-3xl font-bold tracking-tight">{studyKit.title}</h1>
          <p className="text-muted-foreground">Summary</p>
        </div>
      </div>

      {/* Summary Content */}
      <Card>
        <CardHeader>
          <CardTitle>Key Concepts & Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{studyKit.summary}</div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/study-kit/${id}`}>← Back to Study Kit</Link>
        </Button>
        <Button asChild>
          <Link href={`/study-kit/${id}/flashcards`}>Study Flashcards →</Link>
        </Button>
      </div>
    </div>
  );
}
