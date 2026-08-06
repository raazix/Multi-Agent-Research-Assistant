"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Application Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize UI preferences and appearance theme.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Theme */}
        <Card className="border bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Theme & Appearance
            </CardTitle>
            <CardDescription>Configure dark mode and UI appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Theme Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark interface</p>
              </div>
              <Select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-40"
              >
                <option value="dark">🌙 Dark Mode</option>
                <option value="light">☀️ Light Mode</option>
                <option value="system">💻 System Default</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
