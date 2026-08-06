export interface ResearchRequest {
  topic: string;
  instructions?: string;
  depth: "basic" | "standard" | "advanced";
  sourcePreference: "official" | "academic" | "news" | "mixed";
}

export interface ResearchResponse {
  id: string;
  topic: string;
  status: "pending" | "searching" | "reading" | "writing" | "critiquing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  name: string;
  status: "waiting" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  elapsedMs?: number;
}

export interface ResearchProgress {
  id: string;
  topic: string;
  status: ResearchResponse["status"];
  stages: PipelineStage[];
  currentStage: number;
  logs: ResearchLog[];
  sources: Source[];
  report?: Report;
  error?: string;
}

export interface ResearchLog {
  timestamp: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  reliability: "academic" | "government" | "news" | "official" | "unknown";
  snippet?: string;
}

export interface Report {
  id: string;
  content: string;
  title: string;
  generatedAt: string;
  wordCount: number;
  sourcesUsed: number;
}

export interface DashboardStats {
  reportsGenerated: number;
  averageResearchTime: number;
  successfulPipelines: number;
  sourcesProcessed: number;
}

export interface RecentReport {
  id: string;
  title: string;
  topic: string;
  status: ResearchResponse["status"];
  createdAt: string;
  completedAt?: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  apiUrl: string;
  animationsEnabled: boolean;
  fontSize: "small" | "medium" | "large";
  exportFormat: "markdown" | "pdf" | "both";
}