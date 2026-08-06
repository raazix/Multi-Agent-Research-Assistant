"use client";

import { useState } from "react";
import { useHistory } from "@/hooks/use-research";
import { useAppStore } from "@/store/app-store";
import { researchApi } from "@/services/research-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { History, ArrowRight, Clock, Trash2, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

export default function ResearchHistoryPage() {
  const { data: serverHistory, isLoading, refetch } = useHistory();
  const { recentResearches, deleteRecentResearch } = useAppStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const rawList = (serverHistory && serverHistory.length > 0)
    ? serverHistory
    : (recentResearches || []).map((r) => ({
        id: r.id,
        title: r.topic,
        topic: r.topic,
        status: r.status,
        createdAt: r.logs[0]?.timestamp || new Date().toISOString(),
      }));

  // Filter unique items by ID
  const historyList = rawList.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      deleteRecentResearch(id);
      await researchApi.deleteHistoryItem(id).catch(() => {});
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = async (id: string, topic: string) => {
    setDownloadingId(id);
    try {
      const reportData = await researchApi.getReport(id);
      const content = reportData?.content || `# ${topic}\n\nNo detailed report content available.`;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${topic} - Anveshan AI Report</title>
              <style>
                body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 40px; color: #111827; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                h1 { font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; }
                h3 { font-size: 16px; margin-top: 18px; }
                p, li { font-size: 14px; color: #374151; }
                code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; }
                pre { background: #1f2937; color: #f9fafb; padding: 12px; border-radius: 6px; overflow-x: auto; }
                pre code { background: transparent; color: inherit; }
                ul, ol { padding-left: 20px; }
                a { color: #2563eb; text-decoration: underline; }
                @page { size: A4; margin: 15mm; }
              </style>
            </head>
            <body>
              <div id="content"></div>
              <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
              <script>
                document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 350);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (e) {
      alert("Could not download PDF for this topic.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Research History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete log of all past multi-agent research sessions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Loading research history...
        </Card>
      ) : historyList.length === 0 ? (
        <EmptyState
          title="No History Yet"
          description="You haven't initiated any research tasks yet."
          icon={History}
        />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y border-border">
            {historyList.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-accent/40 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <Link
                    href={`/research/${item.id}`}
                    className="font-medium text-sm hover:underline truncate block"
                  >
                    {item.title || item.topic}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Badge
                    variant={item.status === "completed" ? "success" : item.status === "failed" ? "danger" : "secondary"}
                    className="capitalize"
                  >
                    {item.status}
                  </Badge>

                  <Link href={`/research/${item.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      View <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingId === item.id}
                    onClick={() => handleDownloadPDF(item.id, item.title || item.topic)}
                    className="gap-1 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Download PDF Report"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    Download PDF
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Delete research topic"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
