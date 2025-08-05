'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowLeft, Copy, Download, Check, Github, Terminal } from 'lucide-react'
import { generateCommandMarkdown } from '@/lib/utils'
import { generateCategoryDisplayName, getCategoryIcon, type Command } from '@/lib/commands-types'
import { generateBWCCommands } from '@/lib/bwc-utils'

interface CommandPageClientProps {
  command: Command
}

export function CommandPageClient({ command }: CommandPageClientProps) {
  const [copied, setCopied] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  
  const categoryName = generateCategoryDisplayName(command.category)
  const categoryIcon = getCategoryIcon(command.category)
  const commandName = `/${command.slug.replace(/-/g, '_')}`
  
  const handleCopy = async () => {
    const markdown = generateCommandMarkdown(command)
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = () => {
    const markdown = generateCommandMarkdown(command)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${command.slug}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  
  // Format the content for display
  const lines = command.content.split('\n')
  const formattedContent = lines.map((line, i) => {
    // Handle headers
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>
    }
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.replace('# ', '')}</h1>
    }
    
    // Handle lists
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-6 list-disc">{line.replace('- ', '')}</li>
    }
    if (/^\d+\. /.test(line)) {
      return <li key={i} className="ml-6 list-decimal">{line.replace(/^\d+\. /, '')}</li>
    }
    
    // Handle code blocks
    if (line.startsWith('```')) {
      return <div key={i} className="font-mono text-sm bg-muted p-2 rounded my-2">{line}</div>
    }
    
    // Handle inline code
    if (line.includes('`')) {
      const parts = line.split('`')
      return (
        <p key={i} className="mb-3">
          {parts.map((part, j) => 
            j % 2 === 0 ? part : <code key={j} className="bg-muted px-1 rounded text-sm">{part}</code>
          )}
        </p>
      )
    }
    
    // Regular paragraphs
    if (line.trim()) {
      return <p key={i} className="mb-3">{line}</p>
    }
    
    return <br key={i} />
  })
  
  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button */}
          <Link href="/commands" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Commands
          </Link>
          
          {/* Header */}
          <div className="mb-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Terminal className="h-8 w-8 text-primary flex-shrink-0" />
                  <h1 className="text-3xl font-mono font-bold">{commandName}</h1>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? 'Copied!' : 'Copy markdown'}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download markdown file</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="inline-flex items-center gap-1 whitespace-nowrap text-sm">
                  <span className="flex-shrink-0">{categoryIcon}</span>
                  <span>{categoryName}</span>
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">{command.description}</p>
            </div>
            {command.argumentHint && (
              <div className="text-sm mb-2">
                <span className="font-medium">Arguments:</span> <code className="bg-muted px-2 py-1 rounded">{command.argumentHint}</code>
              </div>
            )}
            {command.allowedTools && (
              <div className="text-sm mb-2">
                <span className="font-medium">Allowed Tools:</span> {command.allowedTools}
              </div>
            )}
            {command.model && (
              <div className="text-sm">
                <span className="font-medium">Model:</span> {command.model}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-primary/10 rounded-lg p-6 mb-8 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                onClick={handleCopy}
                className="w-full justify-center gap-2"
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Markdown Content
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownload}
                className="w-full justify-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download {command.slug}.md
              </Button>
            </div>
          </div>
          
          {/* Installation */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Installation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  Option A: Install using BWC CLI (Recommended)
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Install and manage this command with a single command:</p>
                  <div className="bg-background rounded p-3 font-mono text-sm flex items-center justify-between">
                    <span>bwc command add {command.slug}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await navigator.clipboard.writeText(`bwc command add ${command.slug}`)
                        setCopiedCommand('install')
                        setTimeout(() => setCopiedCommand(null), 2000)
                      }}
                    >
                      {copiedCommand === 'install' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Option B: Install as User Command (manual)</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">macOS/Linux:</p>
                  <div className="bg-background rounded p-3 font-mono text-sm">
                    cp {command.slug}.md ~/.claude/commands/
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Windows:</p>
                  <div className="bg-background rounded p-3 font-mono text-sm">
                    copy {command.slug}.md %USERPROFILE%\.claude\commands\
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Option C: Install as Project Command (manual)</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">macOS/Linux:</p>
                  <div className="bg-background rounded p-3 font-mono text-sm">
                    mkdir -p .claude/commands && cp {command.slug}.md .claude/commands/
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Windows:</p>
                  <div className="bg-background rounded p-3 font-mono text-sm">
                    mkdir .claude\commands 2&gt;nul && copy {command.slug}.md .claude\commands\
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> After installation, restart Claude Code to load the new command.
                </p>
              </div>
            </div>
          </div>
          
          {/* Usage Examples */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Usage</h2>
            <div className="bg-muted rounded p-3">
              <p className="text-sm font-medium mb-1">Slash command:</p>
              <code className="text-sm">{commandName} {command.argumentHint || ''}</code>
            </div>
          </div>
          
          {/* Command Content */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Command Instructions</h2>
            <div className="bg-muted rounded-lg p-6 prose prose-sm max-w-none">
              {formattedContent}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <a 
              href={`https://github.com/davepoon/claude-code-subagents-collection/blob/main/commands/${command.slug}.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
            <Link href="/commands">
              <Button variant="outline">Browse More Commands</Button>
            </Link>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}