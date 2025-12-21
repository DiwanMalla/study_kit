// Utility to pick a Material Icon and color for a summary based on its title/content
export const SUBJECT_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
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

export function getIconForSummary(title: string) {
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
