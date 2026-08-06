import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, ShieldCheck } from "lucide-react";
import { getDomainFromUrl } from "@/lib/utils";

export function SourcePanel({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <Card className="border bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Primary Sources ({sources.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {sources.map((url, i) => {
          const domain = getDomainFromUrl(url);
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg border bg-background/50 hover:bg-accent/40 transition-colors group text-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="font-semibold text-foreground truncate">{domain}</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
