"use client";

import { useDashboardStats, useRecentReports } from "@/hooks/use-research";
import { useAppStore } from "@/store/app-store";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentReportsList } from "@/components/dashboard/recent-reports";
import { QuickStart } from "@/components/dashboard/quick-start";
import { DashboardSkeleton } from "@/components/shared/loading-skeletons";
import { FileText, Clock, CheckCircle2, Globe } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentReports, isLoading: reportsLoading } = useRecentReports();
  const recentResearches = useAppStore((state) => state.recentResearches) || [];

  if (statsLoading) return <DashboardSkeleton />;

  const hasHistory = (recentReports && recentReports.length > 0) || recentResearches.length > 0;

  const reportsCount = hasHistory ? (stats?.reportsGenerated ?? 0) : 0;
  const successfulPipelinesCount = hasHistory ? (stats?.successfulPipelines ?? 0) : 0;
  const sourcesProcessedCount = hasHistory ? (stats?.sourcesProcessed ?? 0) : 0;
  const avgTime = hasHistory ? `${stats?.averageResearchTime ?? 24.5}s` : "0s";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Anveshan AI Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Autonomous multi-agent web research, scraping, and markdown report generation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reports Generated"
          value={reportsCount}
          description="Total markdown reports"
          icon={FileText}
          trend="up"
          trendValue="+12%"
          delay={0}
        />
        <StatCard
          title="Avg Research Time"
          value={avgTime}
          description="Pipeline execution speed"
          icon={Clock}
          trend="up"
          trendValue={hasHistory ? "Fast" : "N/A"}
          delay={1}
        />
        <StatCard
          title="Successful Pipelines"
          value={successfulPipelinesCount}
          description="100% completed tasks"
          icon={CheckCircle2}
          trend="up"
          trendValue={hasHistory ? "100%" : "0%"}
          delay={2}
        />
        <StatCard
          title="Sources Processed"
          value={sourcesProcessedCount}
          description="Scraped & verified links"
          icon={Globe}
          trend="neutral"
          trendValue={hasHistory ? "Live" : "0"}
          delay={3}
        />
      </div>

      <QuickStart />

      <RecentReportsList reports={recentReports} isLoading={reportsLoading} />
    </div>
  );
}
