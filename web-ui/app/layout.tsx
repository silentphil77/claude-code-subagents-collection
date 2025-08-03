import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Navigation } from "@/components/navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Claude Code Subagents & Commands Collection",
  description: "A comprehensive collection of 40+ specialized AI subagents & commands for Claude Code, designed to enhance development workflows with domain-specific expertise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Navigation />
        <div className="h-16" /> {/* Spacer for fixed nav */}
        {children}
        <footer className="border-t border-border/40 bg-card/50">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Made with <span className="text-primary">❤️</span> by the Claude Code community
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  MIT License
                </a>
                <span className="text-muted-foreground/40">•</span>
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contributing
                </a>
                <span className="text-muted-foreground/40">•</span>
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
