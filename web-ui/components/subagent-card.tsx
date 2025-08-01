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
import { Copy, Download, Check } from 'lucide-react'
import { generateCategoryDisplayName, getCategoryIcon } from '@/lib/subagents-types'
import { generateSubagentMarkdown } from '@/lib/utils'
import type { Subagent } from '@/lib/subagents-types'

interface SubagentCardProps {
  subagent: Subagent
}

const categoryColors: Record<string, string> = {
  'development-architecture': 'border-blue-500/50 text-blue-400',
  'language-specialists': 'border-green-500/50 text-green-400',
  'infrastructure-operations': 'border-orange-500/50 text-orange-400',
  'quality-security': 'border-red-500/50 text-red-400',
  'data-ai': 'border-purple-500/50 text-purple-400',
  'specialized-domains': 'border-indigo-500/50 text-indigo-400',
  'crypto-trading': 'border-yellow-500/50 text-yellow-400'
}

const defaultColorClass = 'border-gray-500/50 text-gray-400'

export function SubagentCard({ subagent }: SubagentCardProps) {
  const [copied, setCopied] = useState(false)
  const categoryName = generateCategoryDisplayName(subagent.category)
  const categoryIcon = getCategoryIcon(subagent.category)
  const colorClass = categoryColors[subagent.category] || defaultColorClass
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const markdown = generateSubagentMarkdown(subagent)
    await navigator.clipboard.writeText(markdown)
    
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
  
  return (
    <TooltipProvider>
      <div className="relative group">
        <Link href={`/subagent/${subagent.slug}`}>
          <Card className="h-full card-hover border-border/50 hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden">
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl font-semibold">{subagent.name}</CardTitle>
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
                {subagent.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subagent.tools && (
                <div className="text-sm text-muted-foreground/60 font-mono">
                  <span className="font-sans font-medium text-muted-foreground/80">Tools:</span> {subagent.tools}
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