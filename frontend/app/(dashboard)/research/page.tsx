"use client";

import { useSearchParams } from "next/navigation";
import { ResearchForm } from "@/components/research/research-form";

export default function NewResearchPage() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Research Project</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure topic, depth, and source preference to deploy your multi-agent AI team.
        </p>
      </div>

      <ResearchForm initialTopic={initialTopic} />
    </div>
  );
}
