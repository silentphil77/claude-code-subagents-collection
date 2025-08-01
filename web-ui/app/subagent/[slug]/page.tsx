import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSubagentBySlug, getAllSubagents } from '@/lib/subagents-server'
import { CATEGORIES, type CategoryKey } from '@/lib/subagents-types'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

interface SubagentPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: SubagentPageProps): Promise<Metadata> {
  const { slug } = await params
  const subagent = getSubagentBySlug(slug)
  
  if (!subagent) {
    return {
      title: 'Subagent Not Found',
    }
  }
  
  return {
    title: `${subagent.name} - Claude Code Subagents`,
    description: subagent.description,
  }
}

export async function generateStaticParams() {
  const subagents = getAllSubagents()
  return subagents.map((subagent) => ({
    slug: subagent.slug,
  }))
}

export default async function SubagentPage({ params }: SubagentPageProps) {
  const { slug } = await params
  const subagent = getSubagentBySlug(slug)
  
  if (!subagent) {
    notFound()
  }
  
  const categoryKey = subagent.category as CategoryKey
  const categoryName = CATEGORIES[categoryKey]
  
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
            <Badge variant="secondary">{categoryName}</Badge>
          </div>
          <p className="text-lg text-muted-foreground mb-4">{subagent.description}</p>
          {subagent.tools && (
            <div className="text-sm">
              <span className="font-medium">Available Tools:</span> {subagent.tools}
            </div>
          )}
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
            href={`https://github.com/davepoon/claude-code-subagents-collection/blob/main/${subagent.slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>View on GitHub</Button>
          </a>
          <Link href="/browse">
            <Button variant="outline">Browse More Subagents</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}