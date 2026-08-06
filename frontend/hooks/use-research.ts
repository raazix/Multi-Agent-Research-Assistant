"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { researchApi } from "@/services/research-api";
import { ResearchRequest, ResearchProgress, ResearchResponse } from "@/types";
import { useAppStore } from "@/store/app-store";

const POLL_INTERVAL = 2000;

export function useStartResearch() {
  const queryClient = useQueryClient();
  const setActiveResearch = useAppStore((s) => s.setActiveResearch);

  return useMutation({
    mutationFn: (data: ResearchRequest) => researchApi.startResearch(data),
    onSuccess: (data: ResearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["recent-reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setActiveResearch({
        id: data.id,
        topic: data.topic,
        status: "pending",
        stages: [
          { name: "Search Agent", status: "waiting" },
          { name: "Reader Agent", status: "waiting" },
          { name: "Writer Agent", status: "waiting" },
          { name: "Critic Agent", status: "waiting" },
        ],
        currentStage: 0,
        logs: [{ timestamp: new Date().toISOString(), message: "Research pipeline initialized", level: "info" }],
        sources: [],
      });
    },
  });
}

export function useResearchProgress(researchId: string | null) {
  const setActiveResearch = useAppStore((s) => s.setActiveResearch);
  const addRecentResearch = useAppStore((s) => s.addRecentResearch);
  const [isPolling, setIsPolling] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["research-progress", researchId],
    queryFn: () => (researchId ? researchApi.getResearchProgress(researchId) : null),
    enabled: !!researchId && isPolling,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: POLL_INTERVAL - 100,
  });

  useEffect(() => {
    if (data) {
      setActiveResearch(data);
      if (data.status === "completed" || data.status === "failed") {
        setIsPolling(false);
        if (data.status === "completed" && data.report) {
          addRecentResearch(data);
        }
      }
    }
  }, [data, setActiveResearch, addRecentResearch]);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  return { data, isLoading, error, isPolling, startPolling, stopPolling };
}

export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => (reportId ? researchApi.getReport(reportId) : null),
    enabled: !!reportId,
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: researchApi.getDashboardStats, staleTime: 60000 });
}

export function useRecentReports() {
  return useQuery({ queryKey: ["recent-reports"], queryFn: researchApi.getRecentReports, staleTime: 30000 });
}

export function useAllReports() {
  return useQuery({ queryKey: ["all-reports"], queryFn: researchApi.getAllReports, staleTime: 30000 });
}

export function useHistory() {
  return useQuery({ queryKey: ["history"], queryFn: researchApi.getHistory, staleTime: 30000 });
}