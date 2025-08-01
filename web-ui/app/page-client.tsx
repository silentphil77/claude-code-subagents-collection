'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubagentCard } from '@/components/subagent-card'
import { Terminal, Zap, Shield, Database, Brain, Code2, Download, ArrowRight } from 'lucide-react'
import type { Subagent } from '@/lib/subagents-types'

interface HomePageClientProps {
  allSubagents: Subagent[]
  featuredSubagents: Subagent[]
}

export default function HomePageClient({ allSubagents, featuredSubagents }: HomePageClientProps) {

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-radial opacity-40" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            <h1 className="text-display-1 font-bold mb-6 animate-fade-in relative">
              
              <br />
              <span className="rotate-[4deg] tracking-wide static mx-auto mb-2 w-fit font-mono text-sm animate-fade-in bg-primary/40 p-2 rounded-sm block md:absolute top-[50px] right-[130px]" style={{ animationDelay: '0.1s' }}>
                &quot;You&apos;re absolutely right!&quot;
              </span>
              <span className="text-gradient">Claude Code</span>
              <br />
              <span className="text-foreground">Subagents Collection</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Enhance your AI development with 40+ specialized experts. 
              Get domain-specific assistance instantly.
            </p>
            <div className="flex gap-4 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link href="/browse">
                <Button size="lg" className="btn-gradient gap-2 px-8">
                  Browse All Subagents <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs/installation">
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="gap-2 border border-border/50 hover:bg-primary/10 hover:text-primary px-8"
                >
                  <Download className="h-4 w-4" />
                  Installation Guide
                </Button>
              </Link>
              <a 
                href="https://github.com/davepoon/claude-code-subagents-collection" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="ghost" className="border border-border/50 hover:bg-primary/10 hover:text-primary">
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-4xl font-bold text-primary mb-2">{allSubagents.length}+</div>
              <div className="text-sm text-muted-foreground">Subagents</div>
            </div>
            <div className="text-center p-8 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-4xl font-bold text-primary mb-2">7</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center p-8 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-4xl font-bold text-primary mb-2">Active</div>
              <div className="text-sm text-muted-foreground">Community</div>
            </div>
            <div className="text-center p-8 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-4xl font-bold text-primary mb-2">MIT</div>
              <div className="text-sm text-muted-foreground">License</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-3 font-bold mb-4">Why Choose Subagents?</h2>
            <p className="text-xl text-muted-foreground">Powerful features to enhance your development workflow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="p-8 bg-card/50 rounded-xl border border-border/50 hover:border-primary/20 transition-colors group">
                <feature.icon className="h-12 w-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
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
      <section className="py-20 bg-gradient-to-b from-transparent to-card/50">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-12 md:p-16 text-center">
            <div className="absolute inset-0 gradient-radial opacity-30" />
            <div className="relative z-10">
              <h2 className="text-display-3 font-bold mb-6">Ready to Supercharge Your Development?</h2>
              <p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
                Install the subagents collection and let Claude Code automatically delegate to domain experts
              </p>
              <div className="bg-background/80 backdrop-blur rounded-xl p-6 max-w-3xl mx-auto mb-10 border border-border/50">
                <code className="text-sm font-mono text-foreground/90">
                  git clone https://github.com/davepoon/claude-code-subagents-collection.git && 
                  {'find claude-code-subagents-collection -name "*.md" -not -name "README.md" -exec cp {} ~/.claude/agents/ \\;'}
                </code>
              </div>
              <Link href="/docs/installation">
                <Button 
                  size="lg" 
                  className="btn-gradient px-10"
                >
                  View Installation Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}