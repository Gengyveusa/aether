"use client";

import { useState, useTransition } from "react";
import { redeemResearchKey } from "@/lib/research-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Loader2 } from "lucide-react";

interface ResearchGateProps {
  hasAccess?: boolean;
}

export function ResearchGate({ hasAccess }: ResearchGateProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (hasAccess) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-green-800 dark:text-green-300">
                Research Portal Unlocked
              </CardTitle>
              <CardDescription>
                You have full access to all research tools and data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <a href="/dashboard">
            <Button className="w-full">Go to Research Dashboard →</Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await redeemResearchKey(key);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Unlock Research Portal</CardTitle>
            <CardDescription>
              Enter your research access key to gain full access to clinics, patients,
              biomarkers, experiments, and datasets.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Enter your access key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isPending}
              className="font-mono"
            />
            <Button type="submit" disabled={isPending || !key.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Unlock"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have a key? Contact your network administrator or research coordinator.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
