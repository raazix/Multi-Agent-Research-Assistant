"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppSettings, ResearchProgress } from "@/types";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  activeResearch: ResearchProgress | null;
  setActiveResearch: (research: ResearchProgress | null) => void;

  recentResearches: ResearchProgress[];
  addRecentResearch: (research: ResearchProgress) => void;
  deleteRecentResearch: (id: string) => void;
}

const defaultSettings: AppSettings = {
  theme: "system",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  animationsEnabled: true,
  fontSize: "medium",
  exportFormat: "markdown",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      activeResearch: null,
      setActiveResearch: (research) => set({ activeResearch: research }),

      recentResearches: [],
      addRecentResearch: (research) =>
        set((state) => ({
          recentResearches: [research, ...state.recentResearches].slice(0, 20),
        })),
      deleteRecentResearch: (id) =>
        set((state) => ({
          recentResearches: state.recentResearches.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "research-assistant-store",
      partialize: (state) => ({
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
        recentResearches: state.recentResearches,
      }),
    }
  )
);