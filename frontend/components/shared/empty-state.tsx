import { LucideIcon, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
  actionText = "Start Research",
  actionHref = "/research",
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button size="sm" className="gap-2 bg-primary">
            {actionText}
          </Button>
        </Link>
      )}
    </Card>
  );
}
