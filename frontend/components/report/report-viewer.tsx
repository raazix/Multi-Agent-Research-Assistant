"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  BookOpen,
  Sparkles,
  FileType,
  FileCode,
} from "lucide-react";

interface ReportViewerProps {
  content: string;
  title: string;
}

export function ReportViewer({ content, title }: ReportViewerProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // 1. Download Markdown (.md)
  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, title]);

  // 2. Download MS Word (.doc)
  const handleDownloadDoc = useCallback(() => {
    const htmlBody = contentRef.current ? contentRef.current.innerHTML : content;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; } h1,h2,h3 { color: #111827; }</style></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + htmlBody + footer;

    const blob = new Blob(["\ufeff", sourceHTML], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_report.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, title]);

  // 3. Export PDF via Print dialog
  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Top Bar with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="text-xs text-muted-foreground">Synthesized Anveshan AI Research Report</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Research Button */}
          <Button
            size="sm"
            onClick={() => router.push("/research")}
            className="gap-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Research
          </Button>

          {/* Copy Button */}
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>

          {/* Download Word (.doc) */}
          <Button variant="outline" size="sm" onClick={handleDownloadDoc} className="gap-1.5 text-xs">
            <FileType className="h-3.5 w-3.5 text-blue-500" /> Word (.doc)
          </Button>

          {/* Download Markdown (.md) */}
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} className="gap-1.5 text-xs">
            <FileCode className="h-3.5 w-3.5 text-amber-500" /> Markdown (.md)
          </Button>

          {/* Export PDF (Print) */}
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5 text-rose-500" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Main Report Body */}
      <Card>
        <CardContent className="p-6 lg:p-8">
          <div
            ref={contentRef}
            className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-a:text-blue-500 leading-relaxed font-sans"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}