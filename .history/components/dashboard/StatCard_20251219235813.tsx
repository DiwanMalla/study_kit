import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "green" | "blue" | "purple";
}

const variants = {
  primary: "bg-primary/10 text-primary",
  green:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  blue: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
  purple:
    "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "primary",
}: StatCardProps) {
  return (
    <div className="bg-surface border border-border p-5 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          variants[variant]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="text-foreground text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
