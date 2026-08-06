import { AlertTriangle, RefreshCw, WifiOff, FileX, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  type?: "network" | "search" | "reader" | "writer" | "critic" | "generic";
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ type = "generic", message, onRetry }: ErrorStateProps) {
  const titles = {
    network: "Connection Error",
    search: "Search Agent Failed",
    reader: "Reader Scraper Error",
    writer: "Writer Draft Failed",
    critic: "Critic Evaluation Error",
    generic: "Research Pipeline Failed",
  };

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center border-rose-500/30 bg-rose-500/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg text-rose-600 dark:text-rose-400">{titles[type]}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {message || "An error occurred while executing the multi-agent pipeline."}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4 gap-2 border-rose-500/30">
          <RefreshCw className="h-4 w-4" /> Retry Pipeline
        </Button>
      )}
    </Card>
  );
}
