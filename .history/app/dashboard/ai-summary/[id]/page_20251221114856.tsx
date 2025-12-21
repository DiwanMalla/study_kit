import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { SummaryActions } from "./summary-actions";

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { id } = await params;

  const summary = await db.summary.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!summary) {
    return notFound();
  }

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <Link
              href="/dashboard/ai-summary"
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-card border border-border hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {summary.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    calendar_today
                  </span>
                  {format(new Date(summary.createdAt), "MMMM do, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>
                  {format(new Date(summary.createdAt), "p")}
                </span>
              </div>
            </div>
          </div>

          <SummaryActions
            summaryId={summary.id}
            summaryText={summary.summaryText}
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="flex flex-col gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">code</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Source Content
                </h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {summary.sourceText}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-card border border-primary/40 dark:border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm h-full relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-yellow-700 dark:text-yellow-200 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    AI Summary
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Generated
                </span>
              </div>
              <div className="relative z-10">
                <MarkdownViewer content={summary.summaryText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
