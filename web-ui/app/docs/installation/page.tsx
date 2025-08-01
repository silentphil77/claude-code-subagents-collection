'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function InstallationPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  const installCommands = {
    allUser: {
      mac: `git clone https://github.com/davepoon/claude-code-subagents-collection.git
find claude-code-subagents-collection -maxdepth 1 -name "*.md" -not -name "README.md" -not -name "CONTRIBUTING.md" -exec cp {} ~/.claude/agents/ \\;`,
      windows: `git clone https://github.com/davepoon/claude-code-subagents-collection.git
for %f in (claude-code-subagents-collection\\*.md) do if not "%f"=="claude-code-subagents-collection\\README.md" if not "%f"=="claude-code-subagents-collection\\CONTRIBUTING.md" copy "%f" %USERPROFILE%\\.claude\\agents\\`
    },
    allProject: {
      mac: `mkdir -p .claude/agents
find /path/to/claude-code-subagents-collection -maxdepth 1 -name "*.md" -not -name "README.md" -not -name "CONTRIBUTING.md" -exec cp {} .claude/agents/ \\;`,
      windows: `mkdir .claude\\agents 2>nul
for %f in (\\path\\to\\claude-code-subagents-collection\\*.md) do if not "%~nxf"=="README.md" if not "%~nxf"=="CONTRIBUTING.md" copy "%f" .claude\\agents\\`
    },
    singleUser: {
      mac: `cp subagent-name.md ~/.claude/agents/`,
      windows: `copy subagent-name.md %USERPROFILE%\\.claude\\agents\\`
    },
    singleProject: {
      mac: `mkdir -p .claude/agents && cp subagent-name.md .claude/agents/`,
      windows: `mkdir .claude\\agents 2>nul && copy subagent-name.md .claude\\agents\\`
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Installation Guide</h1>
              <p className="text-muted-foreground mt-1">
                Learn how to install Claude Code Subagents in your projects
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Quick Tip */}
        <div className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-primary mb-1">Quick Installation Tip</p>
              <p className="text-sm">
                The easiest way to install individual subagents is directly from the browse page!
                Each subagent card has copy and download buttons that appear on hover, allowing you
                to quickly grab any subagent without running terminal commands.
              </p>
              <Link href="/browse">
                <Button variant="outline" size="sm" className="mt-3 gap-2 border-primary/20 hover:bg-primary/10">
                  Browse Subagents <ArrowLeft className="h-3 w-3 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Installation Content */}
        <Tabs defaultValue="all-subagents" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all-subagents">All Subagents</TabsTrigger>
            <TabsTrigger value="single-subagent">Single Subagent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-subagents" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">Install All Subagents</h2>
              <p className="text-muted-foreground">
                Get the complete collection of 40+ specialized subagents for comprehensive AI assistance across all domains.
              </p>
            </div>
            
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="user">User Installation</TabsTrigger>
                <TabsTrigger value="project">Project Installation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="user" className="space-y-6 mt-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <p className="text-sm font-medium mb-1">User Installation</p>
                  <p className="text-sm text-muted-foreground">
                    Installs subagents globally, making them available in all your projects
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">macOS/Linux</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.allUser.mac, 0)}
                      >
                        {copiedIndex === 0 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.allUser.mac}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Windows</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.allUser.windows, 1)}
                      >
                        {copiedIndex === 1 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.allUser.windows}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="project" className="space-y-6 mt-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <p className="text-sm font-medium mb-1">Project Installation</p>
                  <p className="text-sm text-muted-foreground">
                    Installs subagents only for the current project
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">macOS/Linux</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.allProject.mac, 2)}
                      >
                        {copiedIndex === 2 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.allProject.mac}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Windows</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.allProject.windows, 3)}
                      >
                        {copiedIndex === 3 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.allProject.windows}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="single-subagent" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">Install Single Subagent</h2>
              <p className="text-muted-foreground">
                Choose specific subagents based on your project needs. Perfect for focused development work.
              </p>
            </div>
            
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="user">User Installation</TabsTrigger>
                <TabsTrigger value="project">Project Installation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="user" className="space-y-6 mt-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <p className="text-sm font-medium mb-1">Manual Installation</p>
                  <p className="text-sm text-muted-foreground">
                    Replace <code className="bg-background px-1 rounded">subagent-name.md</code> with the actual filename
                  </p>
                  <p className="text-sm text-primary mt-2">
                    💡 Pro tip: Use the copy button on any subagent card in the browse page for easier installation!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">macOS/Linux</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.singleUser.mac, 4)}
                      >
                        {copiedIndex === 4 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.singleUser.mac}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Windows</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.singleUser.windows, 5)}
                      >
                        {copiedIndex === 5 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.singleUser.windows}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="project" className="space-y-6 mt-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <p className="text-sm font-medium mb-1">Manual Installation</p>
                  <p className="text-sm text-muted-foreground">
                    Replace <code className="bg-background px-1 rounded">subagent-name.md</code> with the actual filename
                  </p>
                  <p className="text-sm text-primary mt-2">
                    💡 Pro tip: Use the download button on any subagent card in the browse page for easier installation!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">macOS/Linux</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.singleProject.mac, 6)}
                      >
                        {copiedIndex === 6 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.singleProject.mac}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Windows</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/10"
                        onClick={() => copyToClipboard(installCommands.singleProject.windows, 7)}
                      >
                        {copiedIndex === 7 ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-background/50 border border-border/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{installCommands.singleProject.windows}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        
        {/* After Installation Section */}
        <div className="mt-12 p-6 bg-card/50 rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold mb-4">After Installation</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium mb-1">Restart Claude Code</p>
                <p className="text-sm text-muted-foreground">
                  Restart Claude Code to load the newly installed subagents
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium mb-1">Automatic Invocation</p>
                <p className="text-sm text-muted-foreground">
                  Subagents will be automatically invoked based on the context of your tasks
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium mb-1">Manual Invocation</p>
                <p className="text-sm text-muted-foreground">
                  You can explicitly call subagents using @ mentions or describe the task in natural language
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Resources */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/browse">
            <Button variant="outline" className="gap-2">
              Browse All Subagents
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <a 
            href="https://github.com/davepoon/claude-code-subagents-collection" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              View on GitHub
              <ArrowLeft className="h-4 w-4 rotate-45" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}