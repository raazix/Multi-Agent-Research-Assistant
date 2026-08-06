"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ResearchLog } from "@/types";
import { cn } from "@/lib/utils";
import { Collapsible } from "@/components/ui/collapsible";
import { Info, CheckCircle2, AlertTriangle, XCircle, Terminal } from "lucide-react";

const levelIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const levelColors = {
  info: "text-blue-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
};

interface PipelineLogsProps {
  logs: ResearchLog[];
}

export function PipelineLogs({ logs }: PipelineLogsProps) {
  if (!logs) return null;

  return (
    <Collapsible title={<span className="flex items-center gap-2"><Terminal className="h-4 w-4" /> Pipeline Logs ({logs.length})</span>}>
      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => {
            const Icon = levelIcons[log.level] || Info;
            return (
              <motion.div
                key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 py-1.5 text-sm"
              >
                <span className="mt-0.5 shrink-0 text-[11px] text-muted-foreground font-mono tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                </span>
                <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", levelColors[log.level] || "text-blue-500")} />
                <span className="text-foreground/90">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Collapsible>
  );
}