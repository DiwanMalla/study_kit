"use client";

import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

export function MaterialIcon({
  name,
  className = "",
  size = "medium",
}: MaterialIconProps) {
  const sizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-2xl",
  }[size];

  return (
    <span
      className={cn(
        "material-symbols-outlined notranslate",
        sizeClass,
        className
      )}
    >
      {name}
    </span>
  );
}
