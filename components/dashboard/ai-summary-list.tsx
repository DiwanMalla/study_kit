"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Plus, LibraryBig } from "lucide-react";
import { cn } from "@/lib/utils";

interface Summary {
  id: string;
  title: string;
  summaryText: string;
  sourceText: string;
  createdAt: Date;
}

const SUBJECT_ICONS: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  "computer science": {
    icon: "psychology",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  history: {
    icon: "history_edu",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  biology: {
    icon: "science",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  economics: {
    icon: "menu_book",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  science: {
    icon: "science",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  tech: {
    icon: "psychology",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
};

function getIconForSummary(title: string) {
  const lowerTitle = title.toLowerCase();
  for (const [key, value] of Object.entries(SUBJECT_ICONS)) {
    if (lowerTitle.includes(key)) {
      return value;
    }
  }
  return {
    icon: "library_books",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/20",
  };
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function formatDate(date: unknown): string {
  const d = date instanceof Date ? date : new Date(String(date));
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function AISummaryList() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch("/api/summaries");
        if (res.ok) {
          const data = await res.json();
          setSummaries(data.summaries || []);
          setFilteredSummaries(data.summaries || []);
        }
      } catch (error) {
        console.error("Failed to fetch summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredSummaries(
      summaries.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.summaryText.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, summaries]);

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header with Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Summaries
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-200 w-48 md:w-64"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-[#23220f] transition-colors text-slate-500">
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading summaries...
              </p>
            </div>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">
                  library_books
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                No summaries yet. Create your first one!
              </p>
            </div>
          </div>
        ) : (
          filteredSummaries.map((summary) => {
            const { icon, color, bg } = getIconForSummary(summary.title);
            const keywords = extractKeywords(summary.summaryText);

            return (
              <Link
                key={summary.id}
                href={`/dashboard/ai-summary/${summary.id}`}
                className="summary-card bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2 rounded-lg", bg, color)}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {formatDate(summary.createdAt)}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {summary.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                  {summary.summaryText.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })
        )}

      </div>
    </div>
  );
}
