"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Music,
  ExternalLink,
  Upload,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/music/status-badge";
import { UploadDropzone } from "@/components/music/upload-dropzone";
import { PromptCard } from "@/components/music/prompt-card";
import { SUNO_CREATE_URL, USE_CASE_LABELS, STATUS_CONFIG } from "@/lib/music/constants";
import type { MusicRequest, MusicJobStatus } from "@/lib/music/types";

export function AdminQueueContent() {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/music");
      const data = await res.json();
      setRequests(data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: MusicJobStatus) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`/api/music/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchRequests();
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Group by status for the dashboard view
  const queuedJobs = requests.filter((r) => r.status === "queued");
  const generatingJobs = requests.filter((r) => r.status === "generating");
  const generatedJobs = requests.filter((r) => r.status === "generated");
  const reviewJobs = requests.filter((r) => r.status === "review");
  const otherJobs = requests.filter(
    (r) => !["queued", "generating", "generated", "review"].includes(r.status)
  );

  const StatusSection = ({
    title,
    jobs,
    emptyMessage,
  }: {
    title: string;
    jobs: MusicRequest[];
    emptyMessage: string;
  }) => (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="text-xs">
          {jobs.length}
        </Badge>
      </h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map((req) => (
            <JobCard
              key={req.id}
              request={req}
              isExpanded={expandedId === req.id}
              onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
              onStatusChange={updateStatus}
              isUpdating={updatingStatus === req.id}
              onUploadComplete={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Queued", count: queuedJobs.length, color: "text-blue-600" },
          { label: "Generating", count: generatingJobs.length, color: "text-yellow-600" },
          { label: "Generated", count: generatedJobs.length, color: "text-purple-600" },
          { label: "In Review", count: reviewJobs.length, color: "text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading queue...</div>
      ) : (
        <>
          <StatusSection title="Queued — Ready for Suno" jobs={queuedJobs} emptyMessage="No jobs in queue" />
          <StatusSection title="Generating in Suno" jobs={generatingJobs} emptyMessage="No active generations" />
          <StatusSection title="Generated — Awaiting Review" jobs={generatedJobs} emptyMessage="No completed generations" />
          <StatusSection title="In Review" jobs={reviewJobs} emptyMessage="No jobs in review" />
          {otherJobs.length > 0 && (
            <StatusSection title="Other" jobs={otherJobs} emptyMessage="" />
          )}
        </>
      )}
    </div>
  );
}

// ── Job Card ─────────────────────────────────────────────────────

function JobCard({
  request,
  isExpanded,
  onToggle,
  onStatusChange,
  isUpdating,
  onUploadComplete,
}: {
  request: MusicRequest;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: MusicJobStatus) => void;
  isUpdating: boolean;
  onUploadComplete: () => void;
}) {
  const getNextActions = (status: MusicJobStatus) => {
    switch (status) {
      case "queued":
        return [
          { label: "Start Generating", status: "generating" as MusicJobStatus, variant: "default" as const },
        ];
      case "generating":
        return [
          { label: "Mark Generated", status: "generated" as MusicJobStatus, variant: "default" as const },
        ];
      case "generated":
        return [
          { label: "Send to Review", status: "review" as MusicJobStatus, variant: "default" as const },
        ];
      case "review":
        return [
          { label: "Approve", status: "approved" as MusicJobStatus, variant: "default" as const },
          { label: "Reject", status: "rejected" as MusicJobStatus, variant: "outline" as const },
        ];
      case "approved":
        return [
          { label: "Publish", status: "published" as MusicJobStatus, variant: "default" as const },
        ];
      default:
        return [];
    }
  };

  const actions = getNextActions(request.status);

  return (
    <Card>
      <button className="w-full text-left" onClick={onToggle}>
        <CardHeader className="py-3">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm truncate">{request.title}</CardTitle>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span>{USE_CASE_LABELS[request.use_case]}</span>
                <span>{request.genre} / {request.mood}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {actions.map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(request.id, action.status)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </button>

      {isExpanded && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* Request details */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Genre</span>
              <p className="font-medium">{request.genre}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Mood</span>
              <p className="font-medium">{request.mood}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Tempo</span>
              <p className="font-medium capitalize">{request.tempo}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Voice</span>
              <p className="font-medium capitalize">{request.voice_type.replace("_", " ")}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Duration</span>
              <p className="font-medium">{request.duration_seconds ? `${request.duration_seconds}s` : "Any"}</p>
            </div>
          </div>

          {request.prompt_notes && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <span className="text-xs font-medium text-muted-foreground">User notes:</span>
              <p className="mt-0.5">{request.prompt_notes}</p>
            </div>
          )}

          {/* Suno prompts */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Suno Prompts</h4>
            <div className="grid gap-3">
              {request.generated_prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>

          {/* Upload area (for operator) */}
          {["queued", "generating", "generated"].includes(request.status) && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Generated Audio
              </h4>
              <UploadDropzone
                requestId={request.id}
                onUploadComplete={onUploadComplete}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
