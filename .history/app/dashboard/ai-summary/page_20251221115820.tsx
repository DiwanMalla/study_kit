import { AISummaryList } from "@/components/dashboard/ai-summary-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Summary",
  description: "Review your generated summaries and insights",
};

export default function AISummaryPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full px-6 md:px-10 py-6 md:py-10">
      {/* Header */}
      <header className="flex items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          <a
            href="/dashboard"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </a>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Summary
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review your generated summaries and insights
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/dashboard/ai-summary/new"
            className="px-5 py-3 rounded-full bg-primary hover:bg-[#ebe705] text-slate-900 font-bold shadow-sm flex items-center gap-2 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            New Summary
          </a>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-surface border border-border rounded-2xl py-12 px-8 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-darker dark:text-yellow-200 text-xs font-bold mb-3 border border-primary/20">
              <span className="material-symbols-outlined text-[14px]">
                auto_awesome
              </span>
              AI Powered
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Turn hours of reading into minutes of learning
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Upload your documents, paste text, or link articles. Our AI engine
              extracts key points, generates concise summaries, and helps you
              identify the most critical information for your studies in
              seconds.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-yellow-700 dark:text-yellow-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">
                library_books
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary List */}
      <AISummaryList />
    </div>
  );
}
