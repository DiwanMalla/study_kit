"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  FileText,
  Sparkles,
  GraduationCap,
  Trophy,
  Settings,
} from "lucide-react";

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    href: "/dashboard",
  },
  {
    icon: Bot,
    label: "AI Tutor",
    href: "/dashboard/ai-tutor",
  },
  {
    icon: ClipboardList,
    label: "Assignment Helper",
    href: "/dashboard/assignment-helper",
  },
  {
    icon: FileText,
    label: "AI Summary",
    href: "/dashboard/ai-summary",
  },
  {
    icon: Sparkles,
    label: "Flashcard",
    href: "/dashboard/flashcards",
  },
  {
    icon: GraduationCap,
    label: "AI Quiz",
    href: "/dashboard/ai-quiz",
  },
  {
    icon: Trophy,
    label: "Exam",
    href: "/dashboard/exam",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full border-r bg-card w-64 hidden md:flex sticky top-16 z-30 min-h-[calc(100vh-4rem)]">
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
              <item.icon className="h-4 w-4" />
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
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
