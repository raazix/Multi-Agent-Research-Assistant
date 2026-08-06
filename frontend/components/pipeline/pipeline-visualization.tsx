"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PipelineStage } from "@/types";
import { formatDuration, getStatusColor, getStatusBgColor, cn } from "@/lib/utils";
import { Search, BookOpen, PenTool, ShieldCheck, CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

const stageIcons = [Search, BookOpen, PenTool, ShieldCheck];
const stageLabels = ["Search Agent", "Reader Agent", "Writer Agent", "Critic Agent"];

interface PipelineVisualizationProps {
  stages: PipelineStage[];
  currentStage: number;
}

export function PipelineVisualization({ stages, currentStage }: PipelineVisualizationProps) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {stages.map((stage, index) => {
        const Icon = stageIcons[index] || Search;
        const isActive = index === currentStage;
        const isCompleted = stage.status === "completed";
        const isFailed = stage.status === "failed";
        const isWaiting = stage.status === "waiting";

        return (
          <div key={stage.name || index} className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "flex items-center gap-4 w-full max-w-md rounded-xl border p-4 transition-all duration-500",
                isActive && "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm",
                isCompleted && "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10",
                isFailed && "border-red-500/30 bg-red-50/30 dark:bg-red-950/10",
                isWaiting && "border-border bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                  isActive && "bg-blue-500 text-white shadow-lg shadow-blue-500/25",
                  isCompleted && "bg-emerald-500 text-white",
                  isFailed && "bg-red-500 text-white",
                  isWaiting && "bg-muted text-muted-foreground"
                )}
              >
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                  ) : isCompleted ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                  ) : isFailed ? (
                    <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <XCircle className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Clock className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn("text-sm font-medium", getStatusColor(stage.status))}>
                    {stageLabels[index] || stage.name}
                  </p>
                  {stage.elapsedMs && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDuration(stage.elapsedMs)}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", getStatusBgColor(stage.status))}
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : isActive ? "60%" : isFailed ? "100%" : "0%",
                    }}
                    transition={{ duration: isActive ? 1.5 : 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {index < stages.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.15 + 0.1 }}
                className="h-6 w-px bg-border my-0.5"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}