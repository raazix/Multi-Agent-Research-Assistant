"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
        )}
      >
        <TopBar />
        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}