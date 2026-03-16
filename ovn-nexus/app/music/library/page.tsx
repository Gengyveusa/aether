import type { Metadata } from "next";
import { MusicLibraryContent } from "./library-content";

export const metadata: Metadata = {
  title: "Music Library - OVN Nexus",
};

export default function MusicLibraryPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <p className="mt-2 text-muted-foreground">
          Browse your music requests, preview generated tracks, and manage approvals.
        </p>
      </div>
      <MusicLibraryContent />
    </div>
  );
}
