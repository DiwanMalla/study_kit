import Link from "next/link";
import { LucideIcon, ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  href,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-[#0f172a] group-hover:border-primary transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h4 className="text-base font-bold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
