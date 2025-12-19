import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "green" | "blue" | "purple";
}

const variants = {
  primary: "bg-primary/20 text-[#0f172a]",
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export function StatCard({ label, value, icon: Icon, variant = "primary" }: StatCardProps) {
  return (
    <div className="bg-surface border border-border p-5 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", variants[variant])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="text-foreground text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
