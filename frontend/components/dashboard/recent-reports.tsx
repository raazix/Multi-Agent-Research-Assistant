"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, getStatusColor } from "@/lib/utils";
import { RecentReport } from "@/types";
import { FileText, ArrowRight, Clock } from "lucide-react";

interface RecentReportsProps {
  reports: RecentReport[] | undefined;
  isLoading: boolean;
}

export function RecentReportsList({ reports, isLoading }: RecentReportsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Reports</CardTitle>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {!reports || reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No reports yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start a new research to generate reports</p>
            </div>
          ) : (
            reports.slice(0, 5).map((report, i) => (
              <Link key={`${report.id}-${i}`} href={`/research/${report.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-foreground">{report.title || report.topic}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={report.status === "completed" ? "success" : report.status === "failed" ? "danger" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {report.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(report.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}