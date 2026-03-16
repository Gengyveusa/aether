"use client";

import { useState, useMemo } from "react";
import {
  Brain, Network, GitFork, Plus, Loader2, ChevronDown, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { KnowledgeGraphEdge } from "@/lib/db/types";

const ENTITY_TYPES = ["paper", "experiment", "dataset", "biomarker", "disease", "pathway"] as const;

const RELATIONSHIP_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  cites: "default",
  uses_data: "secondary",
  targets: "destructive",
  associated_with: "outline",
  inhibits: "destructive",
  activates: "default",
  correlates_with: "secondary",
  produces: "default",
};

interface KnowledgeGraphClientProps {
  edges: KnowledgeGraphEdge[];
  totalCount: number;
}

function truncateId(id: string, len = 12): string {
  if (id.length <= len) return id;
  return id.slice(0, len) + "...";
}

export function KnowledgeGraphClient({ edges: initialEdges, totalCount }: KnowledgeGraphClientProps) {
  const [edges, setEdges] = useState(initialEdges);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // New edge form
  const [newEdge, setNewEdge] = useState({
    source_type: "",
    source_id: "",
    target_type: "",
    target_id: "",
    relationship: "",
    confidence: "0.8",
  });

  // Computed values
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      if (sourceTypeFilter !== "all" && e.source_type !== sourceTypeFilter) return false;
      if (targetTypeFilter !== "all" && e.target_type !== targetTypeFilter) return false;
      return true;
    });
  }, [edges, sourceTypeFilter, targetTypeFilter]);

  const groupedEdges = useMemo(() => {
    const groups: Record<string, KnowledgeGraphEdge[]> = {};
    for (const edge of filteredEdges) {
      const key = edge.relationship;
      if (!groups[key]) groups[key] = [];
      groups[key].push(edge);
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredEdges]);

  const entityTypes = useMemo(() => {
    const types = new Set<string>();
    for (const e of edges) {
      types.add(e.source_type);
      types.add(e.target_type);
    }
    return Array.from(types).sort();
  }, [edges]);

  const relationshipTypes = useMemo(() => {
    const types = new Set<string>();
    for (const e of edges) types.add(e.relationship);
    return Array.from(types);
  }, [edges]);

  function toggleGroup(rel: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(rel)) next.delete(rel);
      else next.add(rel);
      return next;
    });
  }

  // Initialize all groups as expanded on first render
  useMemo(() => {
    if (expandedGroups.size === 0 && groupedEdges.length > 0) {
      setExpandedGroups(new Set(groupedEdges.map(([rel]) => rel)));
    }
  }, [groupedEdges.length]);

  async function handleAddEdge() {
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        source_type: newEdge.source_type,
        source_id: newEdge.source_id,
        target_type: newEdge.target_type,
        target_id: newEdge.target_id,
        relationship: newEdge.relationship,
        confidence: parseFloat(newEdge.confidence),
        metadata: {},
      };

      const res = await fetch("/api/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.fieldErrors ? "Validation failed" : err.error || "Failed to add edge");
      }

      const { data: created } = await res.json();
      setEdges((prev) => [created, ...prev]);
      setDialogOpen(false);
      setNewEdge({
        source_type: "",
        source_id: "",
        target_type: "",
        target_id: "",
        relationship: "",
        confidence: "0.8",
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to add edge");
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    newEdge.source_type &&
    newEdge.source_id &&
    newEdge.target_type &&
    newEdge.target_id &&
    newEdge.relationship &&
    !isNaN(parseFloat(newEdge.confidence)) &&
    parseFloat(newEdge.confidence) >= 0 &&
    parseFloat(newEdge.confidence) <= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Knowledge Graph Explorer</h1>
            <p className="text-muted-foreground">
              Explore and manage entity relationships across the research platform
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Edge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Knowledge Graph Edge</DialogTitle>
              <DialogDescription>
                Create a new relationship between two entities in the knowledge graph.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <Select
                    value={newEdge.source_type}
                    onValueChange={(v) => setNewEdge((p) => ({ ...p, source_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source ID</Label>
                  <Input
                    placeholder="Entity UUID or identifier"
                    value={newEdge.source_id}
                    onChange={(e) => setNewEdge((p) => ({ ...p, source_id: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  placeholder="e.g., cites, targets, associated_with"
                  value={newEdge.relationship}
                  onChange={(e) => setNewEdge((p) => ({ ...p, relationship: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Type</Label>
                  <Select
                    value={newEdge.target_type}
                    onValueChange={(v) => setNewEdge((p) => ({ ...p, target_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target ID</Label>
                  <Input
                    placeholder="Entity UUID or identifier"
                    value={newEdge.target_id}
                    onChange={(e) => setNewEdge((p) => ({ ...p, target_id: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confidence (0 - 1)</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={newEdge.confidence}
                  onChange={(e) => setNewEdge((p) => ({ ...p, confidence: e.target.value }))}
                />
              </div>
            </div>

            {saveError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {saveError}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEdge} disabled={!canSave || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Edge"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Edges</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEdges.length} shown after filters
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entityTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              {entityTypes.join(", ") || "None"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Relationship Types</CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipTypes.length}</div>
            <p className="text-xs text-muted-foreground">Distinct relationships</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Source Type</Label>
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All source types</SelectItem>
                  {entityTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Target Type</Label>
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All target types</SelectItem>
                  {entityTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(sourceTypeFilter !== "all" || targetTypeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSourceTypeFilter("all");
                  setTargetTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grouped edge list */}
      <div className="space-y-3">
        {groupedEdges.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Network className="mx-auto mb-3 h-8 w-8 opacity-50" />
              <p>No edges match the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          groupedEdges.map(([relationship, relEdges]) => {
            const isExpanded = expandedGroups.has(relationship);
            return (
              <Card key={relationship}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(relationship)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge variant={RELATIONSHIP_COLORS[relationship] || "secondary"}>
                      {relationship}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {relEdges.length} edge{relEdges.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source Type</TableHead>
                          <TableHead>Source ID</TableHead>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Target Type</TableHead>
                          <TableHead>Target ID</TableHead>
                          <TableHead>Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relEdges.map((edge) => (
                          <TableRow key={edge.id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {edge.source_type}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs max-w-[140px] truncate"
                              title={edge.source_id}
                            >
                              {truncateId(edge.source_id)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={RELATIONSHIP_COLORS[edge.relationship] || "secondary"}
                                className="text-xs"
                              >
                                {edge.relationship}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {edge.target_type}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs max-w-[140px] truncate"
                              title={edge.target_id}
                            >
                              {truncateId(edge.target_id)}
                            </TableCell>
                            <TableCell>
                              {edge.confidence !== null ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        edge.confidence >= 0.8
                                          ? "bg-green-500"
                                          : edge.confidence >= 0.5
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      )}
                                      style={{ width: `${edge.confidence * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground">
                                    {(edge.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">--</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
