import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
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
  title: "Claude Code Subagents Collection",
  description: "A comprehensive collection of 40+ specialized AI subagents for Claude Code, designed to enhance development workflows with domain-specific expertise.",
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
        <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-md font-bold text-gradient">
                  Claude Code Subagents Collection
                </Link>
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Browse
                  </Link>
                  <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary border border-border/50">
                    <GitHubLogoIcon className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
                <a
                  href="https://github.com/davepoon/claude-code-subagents-collection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://img.shields.io/github/stars/davepoon/claude-code-subagents-collection.svg?style=social&label=Star"
                    alt="GitHub stars"
                    className="h-5"
                  />
                </a>
              </div>
            </div>
          </div>
        </nav>
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
      </body>
    </html>
  );
}
