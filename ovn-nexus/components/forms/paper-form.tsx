"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Paper } from "@/lib/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaperFormProps {
  paper?: Paper;
}

export function PaperForm({ paper }: PaperFormProps) {
  const router = useRouter();
  const isEdit = !!paper;

  const [title, setTitle] = useState(paper?.title ?? "");
  const [authors, setAuthors] = useState(paper?.authors.join("\n") ?? "");
  const [journal, setJournal] = useState(paper?.journal ?? "");
  const [doi, setDoi] = useState(paper?.doi ?? "");
  const [pubmedId, setPubmedId] = useState(paper?.pubmed_id ?? "");
  const [abstract, setAbstract] = useState(paper?.abstract ?? "");
  const [publicationDate, setPublicationDate] = useState(paper?.publication_date ?? "");
  const [keywords, setKeywords] = useState(paper?.keywords.join(", ") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      const authorsList = authors.split("\n").map((a) => a.trim()).filter(Boolean);
      if (authorsList.length === 0) {
        throw new Error("At least one author is required");
      }

      const body = {
        title: title.trim(),
        authors: authorsList,
        journal: journal.trim() || null,
        doi: doi.trim() || null,
        pubmed_id: pubmedId.trim() || null,
        abstract: abstract.trim() || null,
        publication_date: publicationDate || null,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };

      const url = isEdit ? `/api/papers/${paper.id}` : "/api/papers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to save paper"
        );
      }

      const { data } = await res.json();

      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/papers/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Paper" : "Add New Paper"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper title"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="authors">Authors (one per line) *</Label>
            <Textarea
              id="authors"
              rows={4}
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder={"Jane Smith\nJohn Doe\nAlice Johnson"}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="journal">Journal</Label>
              <Input
                id="journal"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="e.g. Nature Medicine"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g. 10.1038/s41591-024-00001-x"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pubmed_id">PubMed ID</Label>
              <Input
                id="pubmed_id"
                value={pubmedId}
                onChange={(e) => setPubmedId(e.target.value)}
                placeholder="e.g. 39012345"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publication_date">Publication Date</Label>
              <Input
                id="publication_date"
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              rows={6}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paper abstract..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. periodontitis, microbiome, biomarkers"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Paper"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
