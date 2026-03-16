import type { Metadata } from "next";
import { AdminQueueContent } from "./admin-queue-content";

export const metadata: Metadata = {
  title: "Admin Queue - OVN Nexus Music Studio",
};

export default function AdminQueuePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Operator Queue</h1>
        <p className="mt-2 text-muted-foreground">
          Manage music generation jobs. Copy prompts to Suno, generate tracks, and upload results.
        </p>
      </div>
      <AdminQueueContent />
    </div>
  );
}
