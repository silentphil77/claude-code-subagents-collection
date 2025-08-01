'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubagentCard } from '@/components/subagent-card'
import { InstallationModal } from '@/components/installation-modal'
import { Terminal, Zap, Shield, Database, Brain, Code2, Download, ArrowRight } from 'lucide-react'
import type { Subagent } from '@/lib/subagents-types'

interface HomePageClientProps {
  allSubagents: Subagent[]
  featuredSubagents: Subagent[]
}

export default function HomePageClient({ allSubagents, featuredSubagents }: HomePageClientProps) {
  const [showInstallModal, setShowInstallModal] = useState(false)

  const features = [
    {
      icon: Terminal,
      title: 'Easy Installation',
      description: 'One-click copy or download any subagent directly from the browser'
    },
    {
      icon: Zap,
      title: 'Automatic Invocation',
      description: 'Claude Code automatically delegates to the right specialist'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Each subagent follows best practices and security standards'
    },
    {
      icon: Database,
      title: '40+ Specialists',
      description: 'From backend to crypto trading, we have experts for every domain'
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Enhanced with domain-specific knowledge and capabilities'
    },
    {
      icon: Code2,
      title: 'Open Source',
      description: 'Community-driven development with transparent implementation'
    }
  ]

  const categories = [
    { icon: '🏗️', name: 'Development & Architecture', count: 9 },
    { icon: '💻', name: 'Language Specialists', count: 6 },
    { icon: '🚀', name: 'Infrastructure & Operations', count: 4 },
    { icon: '🛡️', name: 'Quality & Security', count: 5 },
    { icon: '📊', name: 'Data & AI', count: 4 },
    { icon: '🎯', name: 'Specialized Domains', count: 8 },
    { icon: '💰', name: 'Crypto Trading', count: 5 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Claude Code Subagents Collection
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Enhance your AI-powered development with 40+ specialized experts. 
            From backend architecture to crypto trading, get domain-specific assistance instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/browse">
              <Button size="lg" className="gap-2">
                Browse All Subagents <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowInstallModal(true)}
            >
              <Download className="h-4 w-4" />
              Installation Guide
            </Button>
            <a 
              href="https://github.com/davepoon/claude-code-subagents-collection" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary">{allSubagents.length}+</div>
            <div className="text-sm text-muted-foreground">Subagents</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary">7</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary">Active</div>
            <div className="text-sm text-muted-foreground">Community</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary">MIT</div>
            <div className="text-sm text-muted-foreground">License</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {features.map((feature, i) => (
            <div key={i} className="p-6 bg-card rounded-lg border">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Subagents */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Subagents</h2>
          <p className="text-muted-foreground">
            Popular specialists to enhance your development workflow. 
            Hover over any card to copy or download instantly!
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredSubagents.map((subagent) => (
            <SubagentCard key={subagent.slug} subagent={subagent} />
          ))}
        </div>
        <div className="text-center">
          <Link href="/browse">
            <Button variant="outline" size="lg">
              View All Subagents
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground">Find the perfect specialist for your needs</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category, i) => (
            <Link key={i} href={`/browse?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="p-6 bg-card rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} subagents</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Supercharge Your Development?</h2>
          <p className="text-lg mb-8 opacity-90">
            Install the subagents collection and let Claude Code automatically delegate to domain experts
          </p>
          <div className="bg-background/10 backdrop-blur rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <code className="text-sm">
              git clone https://github.com/davepoon/claude-code-subagents-collection.git && 
              find claude-code-subagents-collection -name &quot;*.md&quot; -not -name &quot;README.md&quot; -exec cp {} ~/.claude/agents/ \;
            </code>
          </div>
          <Link href="/docs/installation">
            <Button size="lg" variant="secondary">
              Installation Guide
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Installation Modal */}
      <InstallationModal 
        open={showInstallModal} 
        onOpenChange={setShowInstallModal} 
      />
    </div>
  )
}