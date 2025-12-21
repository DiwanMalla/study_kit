import Link from "next/link";
import { currentUser, auth } from "@clerk/nextjs/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { CreateStudyKit } from "@/components/dashboard/create-study-kit";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

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
      icon: "smart_toy",
      href: "/dashboard/ai-tutor",
    },
    {
      title: "Assignment Helper",
      description: "Get homework help and step-by-step guides.",
      icon: "edit_note",
      href: "/dashboard/assignment-helper",
    },
    {
      title: "AI Summary",
      description: "Summarize long documents in seconds.",
      icon: "description",
      href: "/dashboard/ai-summary",
    },
    {
      title: "Flashcard Studio",
      description: "Generate flashcard decks instantly from files.",
      icon: "layers",
      href: "/dashboard/flashcards",
    },
    {
      title: "AI Quiz",
      description: "Test your knowledge with adaptive quizzes.",
      icon: "check_circle",
      href: "/dashboard/quiz",
    },
    {
      title: "Exam Prep",
      description: "Create comprehensive study guides.",
      icon: "school",
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
    <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-10 pb-20">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {formattedDate}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {greeting}, {user?.firstName || "Student"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Ready to crush your study goals today?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="text-xs font-bold text-slate-400">
            +12 others studying now
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Study Kits"
          value={studyKits.length}
          icon="folder_open"
          variant="primary"
        />
        <StatCard
          label="Flashcards Mastered"
          value={totalFlashcards}
          icon="school"
          variant="green"
        />
        <StatCard
          label="Quizzes Taken"
          value={totalQuizzes}
          icon="check_circle"
          variant="blue"
        />
        <StatCard
          label="Study Hours"
          value="0h"
          icon="schedule"
          variant="purple"
        />
      </section>

      {/* Action Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CreateStudyKit />

        {/* Study Kits Library */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Your Study Kits
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
            {studyKits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <span className="material-symbols-outlined text-[40px] mb-2">
                  folder
                </span>
                <p className="text-sm">No kits yet</p>
              </div>
            ) : (
              studyKits.map((kit) => (
                <Link
                  key={kit.id}
                  href={`/study-kit/${kit.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-border group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-yellow-700 dark:text-yellow-200 shrink-0 transition-colors group-hover:bg-primary group-hover:text-yellow-900">
                    <span className="material-symbols-outlined text-[20px]">
                      auto_awesome
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {kit.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          AI Study Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
