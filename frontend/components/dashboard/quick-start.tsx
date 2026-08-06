"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, TrendingUp, Globe } from "lucide-react";

const quickActions = [
  {
    icon: Sparkles,
    label: "AI Research",
    description: "Deep dive with multi-agent pipeline",
    topic: "Latest AI breakthroughs in 2026",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  {
    icon: TrendingUp,
    label: "Market Analysis",
    description: "Industry trends and forecasts",
    topic: "Global tech market trends 2026",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: Globe,
    label: "Science & Tech",
    description: "Scientific discoveries and research",
    topic: "Recent quantum computing advances",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    icon: Zap,
    label: "Quick Summary",
    description: "Fast overview on any topic",
    topic: "Solid-state battery technology",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

export function QuickStart() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto justify-start gap-3 p-4 text-left hover:bg-accent/50 transition-all"
                onClick={() => router.push(`/research?topic=${encodeURIComponent(action.topic)}`)}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", action.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}