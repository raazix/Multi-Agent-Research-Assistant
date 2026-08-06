"use client";

import { useState } from "react";
import Link from "next/link";
import { useAllReports } from "@/hooks/use-research";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function ReportsGridPage() {
  const { data: reportsData, isLoading } = useAllReports();
  const [search, setSearch] = useState("");

  const reports = reportsData || [];

  const filtered = reports.filter((r) =>
    (r.title || r.topic || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anveshan AI Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and search all reports compiled by your autonomous AI agents.
          </p>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search reports by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Loading reports...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Reports Found"
          description="No research reports match your search filter or none have been generated yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((report) => (
            <Card key={report.id} className="flex flex-col justify-between hover:border-foreground/30 transition-all group">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={report.status === "completed" ? "success" : "secondary"} className="capitalize">
                    {report.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(report.createdAt)}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {report.title || report.topic}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/research/${report.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-between gap-1 mt-2">
                    Read Report <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
