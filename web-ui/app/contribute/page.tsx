'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GitBranch, 
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Copy,
  Users,
  Sparkles,
  AlertCircle,
  Code2,
  Zap,
  BookOpen,
  Heart
} from 'lucide-react'
import { useState } from 'react'

export default function ContributePage() {
  const [copiedSubagent, setCopiedSubagent] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState(false)

  const subagentTemplate = `---
name: your-subagent-name
description: Clear description of when to invoke (under 500 chars)
category: development-architecture # Required
tools: Read, Write, Edit # Optional - omit for all tools
---

You are a [role/expertise description].

## Role
[1-2 sentences describing the subagent's primary role]

## Capabilities
[List 3-5 key capabilities or areas of expertise]

## Approach
[Describe how the subagent should approach tasks]

## Output
[Specify what kind of output the subagent should provide]`

  const commandTemplate = `---
description: Brief explanation of what the command does (10-200 chars)
category: ci-deployment # Required
argument-hint: <optional-args> # Optional
allowed-tools: Read, Write, Edit # Optional - restrict tools
model: opus|sonnet|haiku # Optional - specify model
---

# Command implementation

Detailed instructions for how the command should work...`

  const handleCopySubagent = () => {
    navigator.clipboard.writeText(subagentTemplate)
    setCopiedSubagent(true)
    setTimeout(() => setCopiedSubagent(false), 2000)
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(commandTemplate)
    setCopiedCommand(true)
    setTimeout(() => setCopiedCommand(false), 2000)
  }

  const contributionTypes = [
    {
      icon: Sparkles,
      title: 'Subagents',
      description: 'Specialized AI assistants for specific domains',
      count: '40+',
      href: '#subagents',
      color: 'text-purple-400'
    },
    {
      icon: Terminal,
      title: 'Commands',
      description: 'Slash commands to automate workflows',
      count: '39+',
      href: '#commands',
      color: 'text-blue-400'
    }
  ]

  const subagentCategories = [
    'development-architecture',
    'language-specialists',
    'infrastructure-operations',
    'quality-security',
    'data-ai',
    'specialized-domains',
    'crypto-trading'
  ]

  const commandCategories = [
    'ci-deployment',
    'code-analysis-testing',
    'context-loading-priming',
    'documentation-changelogs',
    'project-task-management',
    'version-control-git',
    'miscellaneous'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-display-3 font-bold mb-4">Contribute</h1>
            <p className="text-xl text-muted-foreground">
              Join our community and help make Claude Code more powerful for everyone
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Quick Start Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Why Contribute?</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Every contribution makes Claude Code better for thousands of developers. Whether you&apos;re sharing 
              your expertise through a specialized subagent or creating a helpful command, you&apos;re helping 
              the community work smarter and faster.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, label: 'Help the Community', value: 'Share your expertise' },
                { icon: Zap, label: 'Instant Deployment', value: 'Auto-published on merge' },
                { icon: GitBranch, label: 'Open Source', value: 'MIT Licensed' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Can You Contribute */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What Can You Contribute?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {contributionTypes.map((type) => (
              <Card key={type.title} className="p-6 border-border/50 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-background ${type.color}`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {type.count}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                <p className="text-muted-foreground mb-4">{type.description}</p>
                <Link href={type.href}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Learn how to create
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Contribution Guides */}
        <section>
          <Tabs defaultValue="subagents" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="subagents">Creating Subagents</TabsTrigger>
              <TabsTrigger value="commands">Creating Commands</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subagents" id="subagents">
              <div className="space-y-8">
                {/* Subagent Structure */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Subagent Structure</h3>
                  <p className="text-muted-foreground mb-4">
                    Every subagent must follow this exact structure:
                  </p>
                  <div className="bg-card rounded-lg border border-border/50 p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-muted-foreground">{`---
name: your-subagent-name
description: Clear description of when to invoke (under 500 chars)
category: ${subagentCategories[0]} # Required
tools: Read, Write, Edit # Optional - omit for all tools
---

You are a [role/expertise description].

## Role
[1-2 sentences describing the subagent's primary role]

## Capabilities
[List 3-5 key capabilities or areas of expertise]

## Approach
[Describe how the subagent should approach tasks]

## Output
[Specify what kind of output the subagent should provide]`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 gap-2"
                    onClick={handleCopySubagent}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedSubagent ? 'Copied!' : 'Copy Template'}
                  </Button>
                </Card>

                {/* Categories */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Valid Categories</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose the most appropriate category for your subagent:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {subagentCategories.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <code className="text-sm text-muted-foreground">{category}</code>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Good vs Bad Examples */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Good Example</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-green-400">✓ Clear trigger conditions</p>
                        <p className="text-muted-foreground">
                          &quot;Validates REST API design, OpenAPI specs, and ensures API best practices. Use when designing or reviewing APIs.&quot;
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-green-400">✓ Specific capabilities</p>
                        <p className="text-muted-foreground">
                          Lists concrete skills like &quot;Validate OpenAPI specifications&quot;
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-green-400">✓ Focused purpose</p>
                        <p className="text-muted-foreground">
                          Single responsibility: API design and validation
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold">Bad Example</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-red-400">✗ Vague description</p>
                        <p className="text-muted-foreground">
                          &quot;Helps with coding tasks and other development work&quot;
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-red-400">✗ Generic capabilities</p>
                        <p className="text-muted-foreground">
                          &quot;Can write code in any language&quot;
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-red-400">✗ Multiple responsibilities</p>
                        <p className="text-muted-foreground">
                          Tries to do frontend, backend, and DevOps
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Testing Steps */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Testing Your Subagent</h3>
                  <ol className="space-y-4">
                    {[
                      {
                        title: 'Install locally',
                        command: 'cp subagents/your-subagent.md ~/.claude/agents/',
                        description: 'Copy to your Claude directory and restart'
                      },
                      {
                        title: 'Test automatic invocation',
                        description: 'Use prompts that should trigger your subagent'
                      },
                      {
                        title: 'Test explicit invocation',
                        description: 'Try: &quot;Use the [subagent-name] to...&quot;'
                      },
                      {
                        title: 'Verify functionality',
                        description: 'Ensure it performs all stated capabilities'
                      }
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.title}</p>
                          {step.command && (
                            <code className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                              {step.command}
                            </code>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="commands" id="commands">
              <div className="space-y-8">
                {/* Command Structure */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Command Structure</h3>
                  <p className="text-muted-foreground mb-4">
                    Every command must follow this structure:
                  </p>
                  <div className="bg-card rounded-lg border border-border/50 p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-muted-foreground">{`---
description: Brief explanation of what the command does (10-200 chars)
category: ${commandCategories[0]} # Required
argument-hint: <optional-args> # Optional
allowed-tools: Read, Write, Edit # Optional - restrict tools
model: opus|sonnet|haiku # Optional - specify model
---

# Command implementation

Detailed instructions for how the command should work...`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 gap-2"
                    onClick={handleCopyCommand}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedCommand ? 'Copied!' : 'Copy Template'}
                  </Button>
                </Card>

                {/* Categories */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Valid Categories</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose the most appropriate category for your command:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {commandCategories.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <code className="text-sm text-muted-foreground">{category}</code>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Command Examples */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-xl font-semibold mb-4">Example Commands</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-semibold text-primary">/create_pr</code>
                        <Badge variant="secondary" className="text-xs">Git</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Creates a pull request with AI-generated summary
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-semibold text-primary">/fix_issue</code>
                        <Badge variant="secondary" className="text-xs">Code Analysis</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Analyzes and fixes code issues automatically
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Submission Process */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Submission Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Code2, title: 'Create', desc: 'Write your subagent or command' },
              { icon: AlertCircle, title: 'Test', desc: 'Verify it works correctly' },
              { icon: GitBranch, title: 'Submit PR', desc: 'Open a pull request' },
              { icon: Zap, title: 'Auto Deploy', desc: 'Merged PRs go live instantly' }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 -right-3 translate-x-full">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16">
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center max-w-2xl mx-auto">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Ready to Contribute?</h2>
              <p className="text-muted-foreground mb-6">
                Check out our detailed contribution guide for step-by-step instructions, 
                best practices, and tips for getting your contribution merged quickly.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="btn-gradient gap-2">
                    Read Full Guide
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}