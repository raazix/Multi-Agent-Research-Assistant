"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export function StatCard({ title, value, description, icon: Icon, trend, trendValue, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              {trend && trendValue && (
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      trend === "up" && "text-emerald-600 dark:text-emerald-400",
                      trend === "down" && "text-red-600 dark:text-red-400",
                      trend === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-xl bg-muted p-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}