import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantum Distillery — Swarm Monitor",
  description: "Real-time monitoring dashboard for Quantum Distillery AI swarm agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased">
        {children}
      </body>
    </html>
  );
}
