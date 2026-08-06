import { apiClient } from "@/lib/api";
import {
  ResearchRequest,
  ResearchResponse,
  ResearchProgress,
  Report,
  DashboardStats,
  RecentReport,
} from "@/types";

export const researchApi = {
  async startResearch(data: ResearchRequest): Promise<ResearchResponse> {
    return apiClient.post<ResearchResponse>("/research/", data);
  },

  async getResearchProgress(id: string): Promise<ResearchProgress> {
    return apiClient.get<ResearchProgress>(`/research/${id}/`);
  },

  async getReport(id: string): Promise<Report> {
    return apiClient.get<Report>(`/report/${id}/`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>("/stats/");
  },

  async getRecentReports(): Promise<RecentReport[]> {
    return apiClient.get<RecentReport[]>("/reports/recent/");
  },

  async getAllReports(): Promise<RecentReport[]> {
    return apiClient.get<RecentReport[]>("/reports/");
  },

  async getHistory(): Promise<RecentReport[]> {
    return apiClient.get<RecentReport[]>("/history/");
  },

  async retryResearch(id: string): Promise<ResearchResponse> {
    return apiClient.post<ResearchResponse>(`/research/${id}/retry/`);
  },

  async deleteHistoryItem(id: string): Promise<void> {
    return apiClient.delete(`/history/${id}/`);
  },
};