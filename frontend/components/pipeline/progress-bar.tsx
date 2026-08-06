"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

export function ProgressBar({ progress, status, className }: ProgressBarProps) {
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {isCompleted ? "Completed" : isFailed ? "Failed" : `Processing... ${Math.round(progress)}%`}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isFailed ? "bg-red-500" : isCompleted ? "bg-emerald-500" : "bg-blue-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}