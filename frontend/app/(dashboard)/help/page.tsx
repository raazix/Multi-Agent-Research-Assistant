import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HelpCircle, Bot, Search, BookOpen, PenTool, Sparkles } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How do the 4 autonomous agents work together?",
      a: "1. Searcher Agent queries Tavily AI Search for reliable candidate links.\n2. Reader Agent uses BeautifulSoup4 to clean HTML and extract facts/statistics.\n3. Writer Agent compiles everything into a structured Markdown research paper.\n4. Critic Agent peer-reviews the report, assigns a score out of 10, and suggests improvements."
    },
    {
      q: "Which LLM model powers inference?",
      a: "The system is powered by Groq (Llama 3.3 70B Versatile) for ultra-fast, high-quality analytical outputs."
    },
    {
      q: "Can I run the backend in CLI mode without the Web UI?",
      a: "Yes! Simply run `python backend/main.py --cli` in your terminal."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Agent Documentation & FAQ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Learn how your autonomous AI research team collaborates to generate reports.
        </p>
      </div>

      {/* Agents Flow Overview */}
      <Card className="border bg-card/60 backdrop-blur-md p-6 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> Autonomous Agent Workflow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-500">
              <Search className="h-4 w-4" /> 1. Searcher Agent
            </div>
            <p className="text-xs text-muted-foreground">
              Queries Tavily Search API to find up-to-date links, news articles, and research papers.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-500">
              <BookOpen className="h-4 w-4" /> 2. Reader Agent
            </div>
            <p className="text-xs text-muted-foreground">
              Parses web pages using BeautifulSoup, stripping ads and extracting key statistical evidence.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-purple-500">
              <PenTool className="h-4 w-4" /> 3. Writer Chain
            </div>
            <p className="text-xs text-muted-foreground">
              Synthesizes research into a structured markdown document with introduction, findings, and sources.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
              <Sparkles className="h-4 w-4" /> 4. Critic Chain
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates report quality, assigns a score out of 10, and highlights missing gaps or strengths.
            </p>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="border bg-card/60 backdrop-blur-md p-6 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-500" /> Frequently Asked Questions
        </h3>
        <div className="space-y-4 divide-y">
          {faqs.map((faq, i) => (
            <div key={i} className="pt-3 space-y-1">
              <h4 className="font-semibold text-sm">{faq.q}</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
