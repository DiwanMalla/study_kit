import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  NotebookPen,
  Sparkles,
  Trophy,
  Upload,
  Bot,
} from "lucide-react";
import { currentUser, auth } from "@clerk/nextjs/server";
import { FileUpload } from "@/components/file-upload";
import { db } from "@/lib/db";
import Link from "next/link";
import { AskAI } from "@/components/ask-ai";


export default async function DashboardPage() {
  const user = await currentUser();
  const { userId } = await auth();

  const quickLinks = [
    {
      title: "AI Tutor",
      description: "One-to-one guidance for tough topics.",
      href: "/dashboard/ai-tutor",
      icon: Bot,
    },
    {
      title: "Assignment Helper",
      description: "Break down tasks and get organized.",
      href: "/dashboard/assignment-helper",
      icon: NotebookPen,
    },
    {
      title: "AI Summary",
      description: "Generate concise study summaries.",
      href: "/dashboard/ai-summary",
      icon: FileText,
    },
    {
      title: "Flashcard Studio",
      description: "Drill key concepts with spaced repetition.",
      href: "/dashboard/flashcards",
      icon: Layers,
    },
    {
      title: "AI Quiz",
      description: "Test yourself with adaptive quizzes.",
      href: "/dashboard/ai-quiz",
      icon: GraduationCap,
    },
    {
      title: "Exam Prep",
      description: "Plan mocks and measure readiness.",
      href: "/dashboard/exam",
      icon: Trophy,
    },
  ];

  // Fetch user's study kits
  const studyKits = userId
    ? await db.studyKit.findMany({
        where: { userId },
        include: {
          file: true,
          flashcards: true,
          quizzes: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const totalFlashcards = studyKits.reduce(
    (acc, kit) => acc + kit.flashcards.length,
    0
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground">Ready to ace your next exam?</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Study Kits
            </CardTitle>
            const totalFlashcards = studyKits.reduce(
              (acc, kit) => acc + kit.flashcards.length,
              0
            );
            const totalQuizzes = studyKits.reduce(
              (acc, kit) => acc + kit.quizzes.length,
              0
            );

            <p className="text-xs text-muted-foreground">
              <div className="container mx-auto p-6 space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Overview</p>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Welcome back, {user?.firstName || "Student"}
                    </h1>
                    <p className="text-muted-foreground">
                      Track your study kits, jump into AI tools, and keep momentum.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link href="/dashboard/ai-tutor">
                        Talk to AI Tutor
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="#upload">
                        Upload & Generate
                        <Upload className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Study Kits"
                    value={studyKits.length}
                    description={
                      studyKits.length === 0
                        ? "Start by uploading a file"
                        : "Recently generated kits"
                    }
                    icon={<BookOpen className="h-4 w-4 text-primary" />}
                  />
                  <StatCard
                    title="Flashcards"
                    value={totalFlashcards}
                    description="Cards ready to review"
                    icon={<Brain className="h-4 w-4 text-primary" />}
                  />
                  <StatCard
                    title="Quizzes"
                    value={totalQuizzes}
                    description="Quizzes generated"
                    icon={<GraduationCap className="h-4 w-4 text-primary" />}
                  />
                  <StatCard
                    title="Study Hours"
                    value="0h"
                    description="Logging coming soon"
                    icon={<Clock className="h-4 w-4 text-primary" />}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">Your Study Kits</CardTitle>
                          <CardDescription>Recently generated materials</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href="#upload">
                            Create new
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {studyKits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                          <p className="font-medium">No study kits yet</p>
                          <p className="text-sm">Upload a file to create your first kit.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studyKits.map((kit) => (
                            <Link
                              key={kit.id}
                              href={`/study-kit/${kit.id}`}
                              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{kit.title}</div>
                                  <p className="text-sm text-muted-foreground">
                                    {kit.flashcards.length} flashcards • {kit.quizzes.length} quiz
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(kit.createdAt).toLocaleDateString()}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card id="upload" className="h-full">
                    <CardHeader>
                      <CardTitle>Create Study Kit</CardTitle>
                      <CardDescription>Upload your study materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUpload />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick workspace</CardTitle>
                    <CardDescription>
                      Jump straight into the AI flows you need today.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {quickLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/60 transition-colors"
                        >
                          <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                  <AskAI />
                  <Card>
                    <CardHeader>
                      <CardTitle>Recap & tips</CardTitle>
                      <CardDescription>Keep momentum with small actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Review at least one flashcard deck today.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Convert one assignment into a checklist with AI.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Run a quick quiz to gauge understanding.</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
