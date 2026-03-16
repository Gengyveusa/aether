"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Paper, KnowledgeGraphEdge } from "@/lib/db/types";
import { formatDate } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface PaperDetailClientProps {
  paper: Paper;
  edges: KnowledgeGraphEdge[];
}

export function PaperDetailClient({ paper, edges }: PaperDetailClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [title, setTitle] = useState(paper.title);
  const [authors, setAuthors] = useState(paper.authors.join("\n"));
  const [journal, setJournal] = useState(paper.journal ?? "");
  const [doi, setDoi] = useState(paper.doi ?? "");
  const [pubmedId, setPubmedId] = useState(paper.pubmed_id ?? "");
  const [abstract, setAbstract] = useState(paper.abstract ?? "");
  const [publicationDate, setPublicationDate] = useState(paper.publication_date ?? "");
  const [keywords, setKeywords] = useState(paper.keywords.join(", "));

  async function handleEdit() {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title,
        authors: authors.split("\n").map((a) => a.trim()).filter(Boolean),
        journal: journal || null,
        doi: doi || null,
        pubmed_id: pubmedId || null,
        abstract: abstract || null,
        publication_date: publicationDate || null,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/papers/${paper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update paper");
      }

      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/papers/${paper.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete paper");
      }
      router.push("/papers");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/papers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Papers
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{paper.title}</h1>
          <p className="text-muted-foreground">
            {paper.authors.join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Paper</DialogTitle>
                <DialogDescription>Update the paper details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-authors">Authors (one per line)</Label>
                  <Textarea id="edit-authors" rows={4} value={authors} onChange={(e) => setAuthors(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-journal">Journal</Label>
                    <Input id="edit-journal" value={journal} onChange={(e) => setJournal(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-doi">DOI</Label>
                    <Input id="edit-doi" value={doi} onChange={(e) => setDoi(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-pubmed">PubMed ID</Label>
                    <Input id="edit-pubmed" value={pubmedId} onChange={(e) => setPubmedId(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Publication Date</Label>
                    <Input id="edit-date" type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-abstract">Abstract</Label>
                  <Textarea id="edit-abstract" rows={6} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
                  <Input id="edit-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEdit} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Paper</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &ldquo;{paper.title}&rdquo;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {paper.journal && (
          <div>
            <span className="text-muted-foreground">Journal:</span>{" "}
            <span className="font-medium">{paper.journal}</span>
          </div>
        )}
        {paper.doi && (
          <div>
            <span className="text-muted-foreground">DOI:</span>{" "}
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline inline-flex items-center gap-1"
            >
              {paper.doi}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {paper.pubmed_id && (
          <div>
            <span className="text-muted-foreground">PubMed:</span>{" "}
            <span className="font-mono">{paper.pubmed_id}</span>
          </div>
        )}
        {paper.publication_date && (
          <div>
            <span className="text-muted-foreground">Published:</span>{" "}
            <span>{formatDate(paper.publication_date)}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="abstract">
        <TabsList>
          <TabsTrigger value="abstract">Abstract</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="abstract">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              {paper.abstract ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{paper.abstract}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No abstract available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              {paper.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No keywords specified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Graph Connections</CardTitle>
            </CardHeader>
            <CardContent>
              {edges.length > 0 ? (
                <div className="space-y-3">
                  {edges.map((edge) => {
                    const isSource = edge.source_id === paper.id;
                    const connectedType = isSource ? edge.target_type : edge.source_type;
                    const connectedId = isSource ? edge.target_id : edge.source_id;

                    return (
                      <div
                        key={edge.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{edge.relationship}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {isSource ? "to" : "from"}
                            </span>
                            <Badge>{connectedType}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {connectedId}
                          </p>
                        </div>
                        {edge.confidence !== null && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="text-sm font-medium">
                              {(edge.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No knowledge graph connections found for this paper.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
