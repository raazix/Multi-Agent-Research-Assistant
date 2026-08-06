"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResearchProgress } from "@/hooks/use-research";
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization";
import { PipelineLogs } from "@/components/pipeline/pipeline-logs";
import { ReportViewer } from "@/components/report/report-viewer";
import { ReportSkeleton } from "@/components/shared/loading-skeletons";
import { ErrorState } from "@/components/shared/error-state";
import { ProgressBar } from "@/components/pipeline/progress-bar";
import { Card, CardContent } from "@/components/ui/card";

export default function LiveResearchPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: research, isLoading, error, startPolling } = useResearchProgress(id);

  useEffect(() => {
    if (id) {
      startPolling();
    }
  }, [id, startPolling]);

  if (isLoading && !research) {
    return <ReportSkeleton />;
  }

  if (error || !research) {
    return <ErrorState message="Could not load research session." />;
  }

  const isCompleted = research.status === "completed" && research.report;
  const progressPercent = Math.min(100, Math.round(((research.currentStage + 1) / 4) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!isCompleted && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{research.topic}</h1>
              <p className="text-xs text-muted-foreground mt-1">Multi-Agent Research Pipeline Running</p>
            </div>

            <ProgressBar progress={progressPercent} status={research.status} />
            <PipelineVisualization stages={research.stages} currentStage={research.currentStage} />
            <PipelineLogs logs={research.logs} />
          </CardContent>
        </Card>
      )}

      {isCompleted && research.report && (
        <ReportViewer content={research.report.content} title={research.report.title} />
      )}
    </div>
  );
}
