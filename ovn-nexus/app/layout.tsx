import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OVN Nexus - Oral-Vascular-Neural Research Platform",
  description: "Global research network for the Oral-Vascular-Neural axis. Connecting dentists, researchers, and biotech to study how oral microbial signals influence systemic disease.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
