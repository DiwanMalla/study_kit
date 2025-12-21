import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { SummaryActions } from "./summary-actions";
import { getIconForSummary } from "@/lib/summary-icons";

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
    include: {
      file: true,
    },
  });

  if (!summary) {
    return notFound();
  }

  const formattedDate = format(new Date(summary.createdAt), "MMMM do, yyyy");
  const formattedTime = format(new Date(summary.createdAt), "h:mm a");
  const { icon, color, bg } = getIconForSummary(summary.title);

  return (
    <div className="w-full mx-auto flex flex-col h-full px-6 md:px-10 py-6 md:py-10">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <Link
            href="/dashboard/ai-summary"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark border border-border hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
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
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  schedule
                </span>
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        <SummaryActions
          summaryId={summary.id}
          summaryText={summary.summaryText}
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 pb-10">
        {/* Source Content */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Source Content
              </h2>
            </div>
            
            {summary.file && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      {summary.file.type === "pdf" ? "picture_as_pdf" : summary.file.type === "pptx" ? "present_to_all" : "image"}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                      {summary.file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">
                      {(summary.file.size / (1024 * 1024)).toFixed(2)} MB • {summary.file.type}
                    </p>
                  </div>
                </div>
                <a 
                  href={summary.file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm"
                  title="View Attachment"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none flex-grow">
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-2">
                {summary.sourceText}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-primary/40 dark:border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm h-full relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Summary
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Generated
              </span>
            </div>
            <div className="space-y-6 relative z-10">
              <MarkdownViewer content={summary.summaryText} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
