"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon, HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: "/browse", label: "Subagents" },
    { href: "/commands", label: "Commands" },
    { href: "/docs", label: "Documentation" },
    { href: "/docs/cli", label: "CLI Tool" },
    { href: "/contribute", label: "Contribute" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-md font-bold text-gradient">
                Build with Claude Code
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {navigationLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <HamburgerMenuIcon className="h-5 w-5" />
              </Button>
              <a 
                href="https://github.com/davepoon/claude-code-subagents-collection" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary border border-border/50">
                  <GitHubLogoIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">GitHub</span>
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
      
      {/* Mobile Menu Dialog */}
      <DialogPrimitive.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay 
            className={cn(
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />
          <DialogPrimitive.Content 
            className={cn(
              "fixed inset-y-0 right-0 z-50 h-full w-full max-w-xs bg-background shadow-xl duration-300",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
            )}
          >
            <DialogPrimitive.Title className="sr-only">Navigation Menu</DialogPrimitive.Title>
            <div className="flex h-full flex-col">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between border-b border-border/40 p-4">
              <Link 
                href="/" 
                className="text-md font-bold text-gradient"
                onClick={() => setMobileMenuOpen(false)}
              >
                Build with Claude Code
              </Link>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Cross2Icon className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </DialogPrimitive.Close>
            </div>
            
            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            
            {/* Footer actions */}
            <div className="border-t border-border/40 p-4 space-y-3">
              <a 
                href="https://github.com/davepoon/claude-code-subagents-collection" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="default" className="w-full justify-center gap-2 btn-gradient">
                  <GitHubLogoIcon className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
              <div className="flex justify-center">
                <a
                  href="https://github.com/davepoon/claude-code-subagents-collection"
                  target="_blank"
                  rel="noopener noreferrer"
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
    </>
  );
}