"use client";

import { formatZAR } from "@/lib/formatters";
import { clsx } from "clsx";

interface ZarAmountProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "gold" | "white" | "green" | "red" | "muted";
}

export function ZarAmount({
  amount,
  className,
  size = "md",
  color = "white",
}: ZarAmountProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-semibold",
    xl: "text-3xl font-bold",
  };

  const colorClasses = {
    gold: "text-primary",
    white: "text-white",
    green: "text-success",
    red: "text-error",
    muted: "text-text-secondary",
  };

  return (
    <span className={clsx(sizeClasses[size], colorClasses[color], className)}>
      {formatZAR(amount)}
    </span>
  );
}
