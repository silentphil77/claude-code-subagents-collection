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
import { ArrowLeft, Copy, Download, Check, Github } from 'lucide-react'
import { CATEGORIES, type CategoryKey, type Subagent } from '@/lib/subagents-types'
import { generateSubagentMarkdown } from '@/lib/utils'

interface SubagentPageClientProps {
  subagent: Subagent
}

export function SubagentPageClient({ subagent }: SubagentPageClientProps) {
  const [copied, setCopied] = useState(false)
  
  const categoryKey = subagent.category as CategoryKey
  const categoryName = CATEGORIES[categoryKey]
  
  const handleCopy = async () => {
    const markdown = generateSubagentMarkdown(subagent)
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = () => {
    const markdown = generateSubagentMarkdown(subagent)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${subagent.slug}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  
  // Format the content for display
  const lines = subagent.content.split('\n')
  const formattedContent = lines.map((line, i) => {
    // Handle headers
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>
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
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold">{subagent.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{categoryName}</Badge>
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
            </div>
            <p className="text-lg text-muted-foreground mb-4">{subagent.description}</p>
            {subagent.tools && (
              <div className="text-sm">
                <span className="font-medium">Available Tools:</span> {subagent.tools}
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
                Download {subagent.slug}.md
              </Button>
            </div>
          </div>
          
          {/* Installation */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Installation</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Install as User Subagent (available in all projects):</p>
                <div className="bg-background rounded p-3 font-mono text-sm">
                  cp {subagent.slug}.md ~/.claude/agents/
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Install as Project Subagent (current project only):</p>
                <div className="bg-background rounded p-3 font-mono text-sm">
                  mkdir -p .claude/agents && cp {subagent.slug}.md .claude/agents/
                </div>
              </div>
            </div>
          </div>
          
          {/* Usage Examples */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Usage Examples</h2>
            <div className="space-y-3">
              <div className="bg-muted rounded p-3">
                <p className="text-sm font-medium mb-1">Automatic invocation:</p>
                <code className="text-sm">Claude Code will automatically use {subagent.name} when appropriate</code>
              </div>
              <div className="bg-muted rounded p-3">
                <p className="text-sm font-medium mb-1">Explicit invocation:</p>
                <code className="text-sm">Use the {subagent.name} to help me...</code>
              </div>
              <div className="bg-muted rounded p-3">
                <p className="text-sm font-medium mb-1">@ mention:</p>
                <code className="text-sm">@agent-{subagent.slug} can you help with...</code>
              </div>
            </div>
          </div>
          
          {/* System Prompt */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">System Prompt</h2>
            <div className="bg-muted rounded-lg p-6 prose prose-sm max-w-none">
              {formattedContent}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <a 
              href={`https://github.com/davepoon/claude-code-subagents-collection/blob/main/subagents/${subagent.slug}.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
            <Link href="/browse">
              <Button variant="outline">Browse More Subagents</Button>
            </Link>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}