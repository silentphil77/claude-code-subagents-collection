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
import { CATEGORIES } from '@/lib/subagents-types'
import { generateSubagentMarkdown } from '@/lib/utils'
import type { Subagent, CategoryKey } from '@/lib/subagents-types'

interface SubagentCardProps {
  subagent: Subagent
}

const categoryColors: Record<CategoryKey, string> = {
  'development-architecture': 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'language-specialists': 'bg-green-500/10 text-green-700 dark:text-green-300',
  'infrastructure-operations': 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  'quality-security': 'bg-red-500/10 text-red-700 dark:text-red-300',
  'data-ai': 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  'specialized-domains': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  'crypto-trading': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
}

export function SubagentCard({ subagent }: SubagentCardProps) {
  const [copied, setCopied] = useState(false)
  const categoryKey = subagent.category as CategoryKey
  const categoryName = CATEGORIES[categoryKey]
  const colorClass = categoryColors[categoryKey]
  
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
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl">{subagent.name}</CardTitle>
                <Badge className={colorClass} variant="secondary">
                  {categoryName}
                </Badge>
              </div>
              <CardDescription className="line-clamp-3">
                {subagent.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subagent.tools && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Tools:</span> {subagent.tools}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
        
        {/* Action buttons - positioned at bottom right */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
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
                variant="secondary"
                className="h-8 w-8"
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