"use client";

import { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const lines = markdown.split("\n");
    const extracted: HeadingItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        extracted.push({ id, text, level });
      }
    });

    setHeadings(extracted);
  }, [markdown]);

  if (headings.length === 0) return null;

  return (
    <div className="w-full rounded-xl border bg-card/50 p-4 backdrop-blur-md">
      <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-primary" /> Table of Contents
      </h4>
      <nav className="space-y-1 text-xs">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(h.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "block py-1 px-2 rounded-md transition-colors hover:bg-muted truncate",
              h.level === 1 && "font-bold text-foreground",
              h.level === 2 && "pl-4 text-muted-foreground hover:text-foreground",
              h.level === 3 && "pl-6 text-muted-foreground/80 hover:text-foreground"
            )}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
