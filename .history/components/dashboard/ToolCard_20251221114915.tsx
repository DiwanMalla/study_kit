import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export function ToolCard({
  title,
  description,
  icon,
  href,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-yellow-900 group-hover:border-primary transition-all duration-300">
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">north_east</span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
