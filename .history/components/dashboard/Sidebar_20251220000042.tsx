"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Moon,
  LayoutGrid,
  Bot,
  FileEdit,
  FileText,
  Layers,
  CheckCircle,
  GraduationCap,
  Settings,
} from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  {
    name: "Toggle theme",
    href: "#",
    icon: Moon,
    onClick: () => {
      document.documentElement.classList.toggle("dark");
    },
  },
];

const toolsNav = [
  { name: "Overview", href: "/dashboard", icon: LayoutGrid },
  { name: "AI Tutor", href: "/dashboard/ai-tutor", icon: Bot },
  {
    name: "Assignment Helper",
    href: "/dashboard/assignment-helper",
    icon: FileEdit,
  },
  { name: "AI Summary", href: "/dashboard/ai-summary", icon: FileText },
  { name: "Flashcard AI", href: "/dashboard/flashcards", icon: Layers },
  { name: "Quiz", href: "/dashboard/quiz", icon: CheckCircle },
  { name: "Exam", href: "/dashboard/exam", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-border bg-background shrink-0 transition-colors duration-300">
      <div className="p-6">
        <div className="flex flex-col">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 2L3 9L16 16L29 9L16 2Z"></path>
              <path
                d="M6 13.5V21.5C6 22.8807 10.4772 24 16 24C21.5228 24 26 22.8807 26 21.5V13.5L16 19L6 13.5Z"
                opacity="0.5"
              ></path>
              <path d="M28 24V11L30 12V24H28Z"></path>
              <circle cx="29" cy="25" fill="currentColor" r="1.5"></circle>
            </svg>
            <h1 className="text-foreground text-lg font-bold leading-normal tracking-tight">
              Super Student Kit
            </h1>
          </Link>
          <p className="text-muted-foreground text-xs font-normal leading-normal mt-1 ml-10">
            Basic Plan
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full transition-all group",
                  pathname === item.href
                    ? "bg-primary text-[#0f172a] shadow-sm font-bold"
                    : "text-muted-foreground hover:bg-surface border border-transparent hover:border-border font-medium"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Tools
          </p>
          <div className="space-y-1">
            {toolsNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full transition-all group",
                  pathname === item.href
                    ? "bg-primary text-[#0f172a] shadow-sm font-bold"
                    : "text-muted-foreground hover:bg-surface border border-transparent hover:border-border font-medium"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-full text-muted-foreground hover:bg-surface border border-transparent hover:border-border transition-all mb-2"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">
              {user?.fullName || "Alex Smith"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || "Free Account"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
