"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useStartResearch } from "@/hooks/use-research";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Loader2 } from "lucide-react";

const researchSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic is too long"),
  instructions: z.string().max(2000, "Instructions too long").optional(),
  depth: z.enum(["basic", "standard", "advanced"]),
  sourcePreference: z.enum(["official", "academic", "news", "mixed"]),
});

type ResearchFormData = z.infer<typeof researchSchema>;

const depthOptions = [
  { value: "basic", label: "Basic — Quick overview (2-3 sources)" },
  { value: "standard", label: "Standard — Balanced research (5-8 sources)" },
  { value: "advanced", label: "Advanced — Deep dive (10+ sources)" },
];

const sourceOptions = [
  { value: "official", label: "Official Sources — Company docs, government data" },
  { value: "academic", label: "Academic — Peer-reviewed papers, journals" },
  { value: "news", label: "News — Current events, media coverage" },
  { value: "mixed", label: "Mixed — Blend of all sources" },
];

export function ResearchForm({ initialTopic = "" }: { initialTopic?: string }) {
  const router = useRouter();
  const { mutate: startResearch, isPending } = useStartResearch();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      topic: initialTopic,
      depth: "standard",
      sourcePreference: "mixed",
    },
  });

  const topicValue = watch("topic");

  const onSubmit = (data: ResearchFormData) => {
    startResearch(data, {
      onSuccess: (response) => {
        router.push(`/research/${response.id}`);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight">Start New Research</h2>
            <p className="text-sm text-muted-foreground">
              Our multi-agent pipeline will search, read, write, and critique a comprehensive report for you.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Topic</label>
              <div className="relative flex items-center">
                <Input
                  {...register("topic")}
                  placeholder="e.g., Quantum Computing breakthroughs & fault-tolerant qubits 2026"
                  className={cn(
                    "h-12 text-sm md:text-base pr-10 placeholder:truncate transition-all duration-200",
                    focusedField === "topic" && "ring-2 ring-ring ring-offset-2",
                    errors.topic && "border-red-500 focus-visible:ring-red-500"
                  )}
                  onFocus={() => setFocusedField("topic")}
                  onBlur={() => setFocusedField(null)}
                />
                <Sparkles className="absolute right-3.5 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
              </div>
              {errors.topic && <p className="text-xs text-red-500">{errors.topic.message}</p>}
              <p className="text-xs text-muted-foreground">{topicValue?.length || 0}/500 characters</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Optional Instructions</label>
              <Textarea
                {...register("instructions")}
                placeholder="Add specific directions, focus areas, or constraints for the research..."
                rows={4}
                className={cn(
                  "transition-all duration-200 resize-none",
                  focusedField === "instructions" && "ring-2 ring-ring ring-offset-2"
                )}
                onFocus={() => setFocusedField("instructions")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Research Depth" {...register("depth")}>
                {depthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>

              <Select label="Source Preference" {...register("sourcePreference")}>
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full h-12 text-base gap-2"
            >
              <Search className="h-4 w-4" />
              Start Research
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}