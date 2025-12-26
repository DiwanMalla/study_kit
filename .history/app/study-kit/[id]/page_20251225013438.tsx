import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BookOpen, Brain, FileText, HelpCircle } from "lucide-react";

interface StudyKitPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyKitPage({ params }: StudyKitPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const studyKit = await db.studyKit.findFirst({
    where: { id, userId },
    include: {
      file: true,
      flashcards: { orderBy: { order: "asc" } },
      quizzes: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!studyKit) notFound();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {studyKit.title}
          </h1>
          <p className="text-muted-foreground">
            Created from {studyKit.file.name}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyKit.flashcards.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quiz Questions
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyKit.quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {studyKit.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Summary
            </CardTitle>
            <CardDescription>
              Quick overview of the key concepts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href={`/study-kit/${id}/summary`}>View Summary</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Flashcards Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Flashcards
            </CardTitle>
            <CardDescription>
              {studyKit.flashcards.length} cards to review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href={`/study-kit/${id}/flashcards`}>Study Flashcards</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quiz Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Practice Quiz
            </CardTitle>
            <CardDescription>Test your knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href={`/study-kit/${id}/quiz`}>Take Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary Preview */}
      {studyKit.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap line-clamp-6">
                {studyKit.summary}
              </p>
            </div>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href={`/study-kit/${id}/summary`}>Read full summary →</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
