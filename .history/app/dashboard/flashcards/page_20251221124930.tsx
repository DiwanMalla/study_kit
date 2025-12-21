import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const { userId } = await auth();

  const decks = userId
    ? await db.studyKit.findMany({
        where: {
          userId,
          flashcards: { some: {} },
        },
        include: {
          _count: { select: { flashcards: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <Link
              href="/dashboard"
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-surface border border-border hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Flashcard AI
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create, manage, and study your flashcard sets powered by AI.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-surface text-slate-600 dark:text-slate-300 hover:border-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">
                history
              </span>
              <span className="text-sm font-bold">History</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-10 pb-20">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-sm group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                  AI Powered
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Create a new study set instantly
                </h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Upload your lecture slides, PDF textbooks, or simply paste
                  your notes. Our AI will generate key concepts and definitions
                  for you in seconds.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/dashboard/flashcards/new"
                    className="px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                    Create New Flashcards
                  </Link>
                  <Link
                    href="/dashboard/flashcards/new"
                    className="px-6 py-3.5 bg-surface border border-border text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-accent transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">
                      upload_file
                    </span>
                    Upload Material
                  </Link>
                </div>
              </div>
              <div className="shrink-0 w-full lg:w-auto flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      From Documents
                    </div>
                    <div className="text-xs text-slate-500">
                      PDF, PPTX, DOCX
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      format_align_left
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      From Text
                    </div>
                    <div className="text-xs text-slate-500">
                      Paste notes or code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Sets */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Flashcard Sets
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <input
                    className="pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-primary transition-colors w-40 md:w-64"
                    placeholder="Search sets..."
                    type="text"
                  />
                </div>
                <button className="p-2 rounded-xl bg-surface border border-border text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck: any) => {
                const totalCards = deck._count.flashcards;
                const reviewedCards = 0;
                const progressPercent = 0;
                return (
                  <div
                    key={deck.id}
                    className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                        {deck.title.substring(0, 2).toUpperCase()}
                      </div>
                      <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">
                          more_horiz
                        </span>
                      </button>
                    </div>
                    <Link
                      href={`/dashboard/flashcards/${deck.id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                        {deck.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                      {deck.summary || "No description available."}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <span>
                          {reviewedCards}/{totalCards} Reviewed
                        </span>
                        <span>{format(new Date(deck.createdAt), "MMM d")}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/flashcards/${deck.id}`}
                          className="flex-1 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity text-center"
                        >
                          Review
                        </Link>
                        <button className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create Empty Set Card */}
              <Link
                href="/dashboard/flashcards/new"
                className="bg-surface border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group h-full min-h-[250px]"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary">
                    add
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Create Empty Set
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Start from scratch without AI
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
