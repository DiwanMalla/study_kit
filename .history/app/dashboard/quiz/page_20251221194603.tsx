import Link from "next/link";
import { db } from "@/lib/db";

const SUBJECT_ICON_COLOR: Record<string, { icon: string; color: string }> = {
  Psychology: { icon: "psychology", color: "blue" },
  Math: { icon: "functions", color: "green" },
  History: { icon: "history_edu", color: "orange" },
  "Computer Science": { icon: "terminal", color: "purple" },
  Biology: { icon: "biotech", color: "pink" },
};

function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; text: string; badge: string }> = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      badge:
        "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      badge:
        "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      badge:
        "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
    },
    pink: {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
      badge: "bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400",
    },
  };
  return colors[color] || colors.blue;
}

function getRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${
      Math.floor(days / 7) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(days / 30)} month${
    Math.floor(days / 30) > 1 ? "s" : ""
  } ago`;
}

export default async function QuizPage() {
  // Fetch quizzes and their question counts
  const quizzes = await db.quiz.findMany({
    include: {
      questions: true,
      studyKit: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Quiz Library
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage your quizzes, track progress, and create new challenges.
              </p>
            </div>
          </div>
          <div>
            <Link
              href="/dashboard/quiz/new"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create New Quiz
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-8 pb-20">
          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const subjectInfo =
                SUBJECT_ICON_COLOR[quiz.subject] ||
                SUBJECT_ICON_COLOR["Psychology"];
              const colors = getColorClasses(subjectInfo.color);
              return (
                <div
                  key={quiz.id}
                  className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:border-primary transition-colors group relative flex flex-col"
                >
                  {/* Header with Icon and Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined">
                        {subjectInfo.icon}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-2 py-1 ${colors.badge} text-[10px] font-bold uppercase tracking-wider rounded-md mb-2`}
                    >
                      {quiz.subject}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 mt-auto">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        format_list_numbered
                      </span>
                      {quiz.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>
                      {getRelativeTime(quiz.createdAt)}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
                  >
                    Start Quiz
                    <span className="material-symbols-outlined text-sm">
                      play_arrow
                    </span>
                  </Link>
                </div>
              );
            })}

            {/* Create New Quiz Card */}
            <Link
              href="/dashboard/quiz/new"
              className="border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-surface transition-all cursor-pointer group min-h-[250px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Create New Quiz
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate questions from your notes or create them manually.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
