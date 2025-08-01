'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy, Download, Check, Terminal } from 'lucide-react'
import { generateCategoryDisplayName, getCategoryIcon } from '@/lib/commands-types'
import { generateCommandMarkdown } from '@/lib/utils'
import type { Command } from '@/lib/commands-types'

interface CommandCardProps {
  command: Command
}

const categoryColors: Record<string, string> = {
  'ci-deployment': 'border-amber-500/50 text-amber-400',
  'code-analysis-testing': 'border-cyan-500/50 text-cyan-400',
  'context-loading-priming': 'border-violet-500/50 text-violet-400',
  'documentation-changelogs': 'border-lime-500/50 text-lime-400',
  'project-task-management': 'border-rose-500/50 text-rose-400',
  'version-control-git': 'border-emerald-500/50 text-emerald-400',
  'miscellaneous': 'border-slate-500/50 text-slate-400'
}

const defaultColorClass = 'border-gray-500/50 text-gray-400'

export function CommandCard({ command }: CommandCardProps) {
  const [copied, setCopied] = useState(false)
  const categoryName = generateCategoryDisplayName(command.category)
  const categoryIcon = getCategoryIcon(command.category)
  const colorClass = categoryColors[command.category] || defaultColorClass
  
  // Format command name from slug
  const commandName = `/${command.slug.replace(/-/g, '_')}`
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const markdown = generateCommandMarkdown(command)
    await navigator.clipboard.writeText(markdown)
    
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
  
  return (
    <TooltipProvider>
      <div className="relative group">
        <Link href={`/command/${command.slug}`}>
          <Card className="h-full card-hover border-border/50 hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden">
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-xl font-mono">{commandName}</CardTitle>
                </div>
                <Badge 
                  className={`${colorClass} bg-transparent border font-medium inline-flex items-center gap-1 whitespace-nowrap text-xs`} 
                  variant="outline"
                >
                  <span className="flex-shrink-0">{categoryIcon}</span>
                  <span>{categoryName}</span>
                </Badge>
              </div>
              <CardDescription className="line-clamp-3 text-muted-foreground/80">
                {command.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {command.argumentHint && (
                <div className="text-sm text-muted-foreground/60 font-mono">
                  <span className="font-sans font-medium text-muted-foreground/80">Arguments:</span> {command.argumentHint}
                </div>
              )}
              {command.model && (
                <div className="text-sm text-muted-foreground/60 mt-1">
                  <span className="font-medium text-muted-foreground/80">Model:</span> {command.model}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
        
        {/* Action buttons - positioned at bottom right */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary/20 hover:text-primary border border-border/50"
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
                variant="ghost"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary/20 hover:text-primary border border-border/50"
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
    </TooltipProvider>
  )
}