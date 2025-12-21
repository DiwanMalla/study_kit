import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: "primary" | "green" | "blue" | "purple";
}

const variants = {
  primary: "bg-primary/20 text-yellow-700 dark:text-yellow-200",
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  purple:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export function StatCard({
  label,
  value,
  icon,
  variant = "primary",
}: StatCardProps) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          variants[variant]
        )}
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {label}
        </p>
        <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
