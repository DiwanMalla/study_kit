import Link from "next/link";
import { currentUser, auth } from "@clerk/nextjs/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { FileUpload } from "@/components/file-upload";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  Bot,
  FileEdit,
  FileText,
  Layers,
  CheckCircle,
  GraduationCap,
  FolderOpen,
  Clock,
  ChevronDown,
  Sparkles,
  Folder,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  const { userId } = await auth();

  const studyKits = userId
    ? await db.studyKit.findMany({
        where: { userId },
        include: {
          file: true,
          flashcards: true,
          quizzes: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const totalFlashcards = studyKits.reduce(
    (acc, kit) => acc + kit.flashcards.length,
    0
  );
  const totalQuizzes = studyKits.reduce(
    (acc, kit) => acc + kit.quizzes.length,
    0
  );

  const tools = [
    {
      title: "AI Tutor",
      description: "Chat with your notes and ask questions.",
      icon: Bot,
      href: "/dashboard/ai-tutor",
    },
    {
      title: "Assignment Helper",
      description: "Get homework help and step-by-step guides.",
      icon: FileEdit,
      href: "/dashboard/assignment-helper",
    },
    {
      title: "AI Summary",
      description: "Summarize long documents in seconds.",
      icon: FileText,
      href: "/dashboard/ai-summary",
    },
    {
      title: "Flashcard Studio",
      description: "Generate flashcard decks instantly from files.",
      icon: Layers,
      href: "/dashboard/flashcards",
    },
    {
      title: "AI Quiz",
      description: "Test your knowledge with adaptive quizzes.",
      icon: CheckCircle,
      href: "/dashboard/quiz",
    },
    {
      title: "Exam Prep",
      description: "Create comprehensive study guides.",
      icon: GraduationCap,
      href: "/dashboard/exam",
    },
  ];

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8 pb-20">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {greeting}, {user?.firstName || "Student"}
          </h2>
          <p className="text-muted-foreground text-base">
            Ready to ace your studies today?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground bg-surface px-3 py-1 rounded-full border border-border">
            {formattedDate}
          </span>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Study Kits"
          value={studyKits.length}
          icon={FolderOpen}
          variant="primary"
        />
        <StatCard
          label="Flashcards Mastered"
          value={totalFlashcards}
          icon={GraduationCap}
          variant="green"
        />
        <StatCard
          label="Quizzes Taken"
          value={totalQuizzes}
          icon={CheckCircle}
          variant="blue"
        />
        <StatCard
          label="Study Hours"
          value="0h"
          icon={Clock}
          variant="purple"
        />
      </section>

      {/* Action Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Create New Study Kit
              </h3>
              <p className="text-muted-foreground text-sm">
                Upload your lecture notes to generate flashcards, summaries, and
                quizzes.
              </p>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
              New
            </span>
          </div>

          <div className="group transition-all">
            <FileUpload />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted-foreground mb-2 block ml-1">
                Select AI Model
              </label>
              <div className="relative">
                <select className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-sm focus:ring-primary focus:ring-2 text-foreground appearance-none">
                  <option>Standard Model (Fast)</option>
                  <option>Deep Learning (Detailed)</option>
                  <option>Exam Prep V2 (Beta)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-muted-foreground pointer-events-none w-4 h-4" />
              </div>
            </div>
            <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-full hover:brightness-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" />
              Generate Kit
            </button>
          </div>
        </div>

        {/* Study Kits Library */}
        <div className="lg:col-span-1 bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Your Study Kits
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
            {studyKits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <Folder className="w-10 h-10 mb-2" />
                <p className="text-sm">No kits yet</p>
              </div>
            ) : (
              studyKits.map((kit) => (
                <Link
                  key={kit.id}
                  href={`/study-kit/${kit.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors border border-transparent hover:border-border group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {kit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {kit.flashcards.length} cards •{" "}
                      {new Date(kit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/dashboard/library"
            className="mt-auto pt-4 text-sm font-bold text-primary hover:underline text-center w-full block"
          >
            View All Library
          </Link>
        </div>
      </section>

      {/* AI Study Tools */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-foreground">AI Study Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
