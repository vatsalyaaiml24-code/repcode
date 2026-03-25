import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "REPCODE",
  description: "Memory system for project decisions"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative">
        {/* Particle background layer (optional, can be enhanced with canvas/JS) */}
        <div className="particle-bg">
          {/* Example: floating blurred circles for mesh/particle effect */}
          <div className="absolute top-1/4 left-1/5 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl animate-float-particles" />
          <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-purple-700/20 rounded-full blur-3xl animate-float-particles" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-float-particles" style={{ animationDelay: '1s' }} />
        </div>
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-65px)] max-w-5xl px-4 py-8 fade-slide-up relative z-10">{children}</main>
      </body>
    </html>
  );
}
