import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold">
                  Claude Code Subagents
                </Link>
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
                    Browse
                  </Link>
                  <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
                    Documentation
                  </Link>
                  <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                    About
                  </Link>
                </div>
              </div>
              <a 
                href="https://github.com/davepoon/claude-code-subagents-collection" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <GitHubLogoIcon className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>Made with ❤️ by the Claude Code community</p>
              <p className="mt-2">
                <Link href="/license" className="hover:text-primary transition-colors">
                  MIT License
                </Link>
                {" · "}
                <Link href="/contributing" className="hover:text-primary transition-colors">
                  Contributing
                </Link>
                {" · "}
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Report Issue
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
