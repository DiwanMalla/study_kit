"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/material-icon";

const sidebarItems = [
  {
    iconName: "dashboard",
    label: "Overview",
    href: "/dashboard",
  },
  {
    iconName: "auto_gpt",
    label: "AI Tutor",
    href: "/dashboard/ai-tutor",
  },
  {
    iconName: "assignment",
    label: "Assignment Helper",
    href: "/dashboard/assignment-helper",
  },
  {
    iconName: "article",
    label: "AI Summary",
    href: "/dashboard/ai-summary",
  },
  {
    iconName: "flip_to_back",
    label: "Flashcard",
    href: "/dashboard/flashcards",
  },
  {
    iconName: "school",
    label: "AI Quiz",
    href: "/dashboard/ai-quiz",
  },
  {
    iconName: "workspace_premium",
    label: "Exam",
    href: "/dashboard/exam",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-col h-full border-r bg-card w-64 sticky top-16 z-30 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <MaterialIcon name={item.iconName} size="small" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4 border-t">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <MaterialIcon name="settings" size="small" />
          Settings
        </Link>
      </div>
    </div>
  );
}
