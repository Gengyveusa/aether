"use client";

import { useState, useEffect, useCallback } from "react";
import { Music, Filter, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/music/status-badge";
import { AudioPlayer } from "@/components/music/audio-player";
import { PromptCard } from "@/components/music/prompt-card";
import { USE_CASE_LABELS } from "@/lib/music/constants";
import type { MusicRequest, MusicJobStatus } from "@/lib/music/types";

export function MusicLibraryContent() {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/music?${params}`);
      const data = await res.json();
      setRequests(data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Music className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">No music requests yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Head to the <a href="/music/generator" className="text-primary hover:underline">Generator</a> to create your first request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <Music className="h-5 w-5 text-primary/50" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{req.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {USE_CASE_LABELS[req.use_case] || req.use_case}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {req.genre} / {req.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={req.status} />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(req.created_at)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {expandedId === req.id && (
                <CardContent className="border-t pt-4 space-y-4">
                  {/* Request details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Tempo</span>
                      <p className="font-medium capitalize">{req.tempo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Voice</span>
                      <p className="font-medium capitalize">{req.voice_type.replace("_", " ")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Instrumentation</span>
                      <p className="font-medium">{req.instrumentation || "Any"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Duration</span>
                      <p className="font-medium">{req.duration_seconds ? `${req.duration_seconds}s` : "Any"}</p>
                    </div>
                  </div>

                  {req.prompt_notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">Notes</span>
                      <p className="mt-0.5">{req.prompt_notes}</p>
                    </div>
                  )}

                  {/* Generated prompts */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Generated Suno Prompts</h4>
                    <div className="grid gap-3">
                      {req.generated_prompts.map((prompt) => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {req.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {req.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
