"use client";

import { cn } from "@/lib/utils/cn";
import { STATUS_CONFIG } from "@/lib/music/constants";
import type { MusicJobStatus } from "@/lib/music/types";

interface StatusBadgeProps {
  status: MusicJobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.color,
        className
      )}
      title={config.description}
    >
      {config.label}
    </span>
  );
}
