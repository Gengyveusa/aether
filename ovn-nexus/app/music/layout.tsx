import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Music Studio - OVN Nexus",
  description: "Generate, manage, and publish AI-powered music for your OVN Nexus content.",
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                OVN
              </div>
              <span className="font-bold">Nexus</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold">AI Music Studio</span>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/music/generator"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Generator
            </Link>
            <Link
              href="/music/library"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Library
            </Link>
            <Link
              href="/music/admin"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Admin Queue
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
