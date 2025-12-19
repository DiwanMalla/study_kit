"use client";

import { useMemo } from "react";

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
  const sizeClass = useMemo(() => {
    return {
      small: "text-sm",
      medium: "text-base",
      large: "text-2xl",
    }[size];
  }, [size]);

  return (
    <span
      className={`material-symbols-outlined ${sizeClass} ${className}`}
      style={{ fontFamily: '"Material Symbols Outlined"' }}
    >
      {name}
    </span>
  );
}
