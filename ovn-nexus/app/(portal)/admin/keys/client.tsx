// @ts-nocheck
"use client";

import { useState, useTransition } from "react";
import {
  generateResearchKey,
  deactivateResearchKey,
  grantResearchAccessByEmail,
} from "@/lib/research-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, UserCheck, Plus, Ban, Loader2, Copy, Check } from "lucide-react";

interface AccessKey {
  id: string;
  key: string;
  is_active: boolean;
  created_at: string;
  used_at: string | null;
  creator: { full_name: string; email: string } | null;
  redeemer: { full_name: string; email: string } | null;
}

interface AdminKeysClientProps {
  initialKeys: AccessKey[];
}

export function AdminKeysClient({ initialKeys }: AdminKeysClientProps) {
  const [keys, setKeys] = useState<AccessKey[]>(initialKeys);
  const [customKey, setCustomKey] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleGenerateKey(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await generateResearchKey(customKey || undefined);
      if (result?.error) {
        showMessage("error", result.error as string);
      } else if (result && "data" in result && result.data) {
        const newKey = result.data as AccessKey;
        setKeys((prev) => [newKey, ...prev]);
        setCustomKey("");
        showMessage("success", `Key generated: ${newKey.key}`);
      }
    });
  }

  function handleDeactivate(keyId: string) {
    startTransition(async () => {
      const result = await deactivateResearchKey(keyId);
      if (result?.error) {
        showMessage("error", result.error);
      } else {
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k))
        );
        showMessage("success", "Key deactivated.");
      }
    });
  }

  function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!grantEmail.trim()) return;
    startTransition(async () => {
      const result = await grantResearchAccessByEmail(grantEmail);
      if (result?.error) {
        showMessage("error", result.error);
      } else {
        setGrantEmail("");
        showMessage("success", `Research access granted to ${result.data?.full_name} (${result.data?.email}).`);
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-3xl font-bold">Research Access Keys</h1>
        <p className="mt-2 text-muted-foreground">
          Generate and manage research portal access keys. Admin only.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Key Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Generate Access Key</CardTitle>
            </div>
            <CardDescription>
              Leave the field blank to auto-generate a UUID key, or enter a custom string.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateKey} className="space-y-3">
              <Input
                placeholder="Custom key (optional)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                disabled={isPending}
                className="font-mono"
              />
              <Button type="submit" disabled={isPending} className="w-full gap-2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Generate Key
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Grant by Email Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle>Grant Access by Email</CardTitle>
            </div>
            <CardDescription>
              Directly grant research access to a registered user without requiring a key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrantAccess} className="space-y-3">
              <Input
                type="email"
                placeholder="user@example.com"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                disabled={isPending}
              />
              <Button
                type="submit"
                disabled={isPending || !grantEmail.trim()}
                variant="outline"
                className="w-full gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Grant Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Access Keys</CardTitle>
          <CardDescription>{keys.length} key{keys.length !== 1 ? "s" : ""} total</CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No keys generated yet. Create one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Used by</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-mono text-xs max-w-[180px] truncate">
                      <div className="flex items-center gap-2">
                        <span title={k.key}>{k.key.length > 24 ? `${k.key.slice(0, 24)}…` : k.key}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy key"
                        >
                          {copiedId === k.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {k.redeemer ? (
                        <Badge variant="secondary" className="text-xs">Used</Badge>
                      ) : k.is_active ? (
                        <Badge variant="default" className="text-xs bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {k.creator?.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {k.redeemer ? (
                        <span title={k.redeemer.email}>{k.redeemer.full_name}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(k.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {k.is_active && !k.redeemer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(k.id)}
                          disabled={isPending}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Ban className="h-3 w-3" />
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
