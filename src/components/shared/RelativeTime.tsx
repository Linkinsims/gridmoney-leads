"use client";

import { formatDistanceToNow } from "date-fns";

interface RelativeTimeProps {
  date: string | Date;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const relative = formatDistanceToNow(d, { addSuffix: true });
  const absolute = d.toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <span
      title={absolute}
      className={className || "text-text-secondary text-sm"}
    >
      {relative}
    </span>
  );
}
