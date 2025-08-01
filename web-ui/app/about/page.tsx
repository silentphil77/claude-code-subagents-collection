import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Github, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Code2,
  Users,
  Zap,
  Target
} from 'lucide-react'

export default function AboutPage() {
  const futureResources = [
    {
      icon: BookOpen,
      title: 'Claude Code Tutorials',
      description: 'Step-by-step guides for common development tasks with Claude Code',
      status: 'Coming Soon'
    },
    {
      icon: Code2,
      title: 'Code Templates Library',
      description: 'Ready-to-use project templates optimized for Claude Code workflows',
      status: 'In Planning'
    },
    {
      icon: Sparkles,
      title: 'Prompt Engineering Guide',
      description: 'Best practices for getting the most out of Claude Code',
      status: 'Coming Soon'
    },
    {
      icon: Users,
      title: 'Community Showcases',
      description: 'Featured projects and success stories from the Claude Code community',
      status: 'In Planning'
    }
  ]
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-display-3 font-bold mb-4">About</h1>
            <p className="text-xl text-muted-foreground">
              Learn about the Claude Code Subagents Collection and our vision for the future
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Project Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">The Project</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Claude Code Subagents Collection is an open-source initiative to enhance Claude Code with 
              specialized AI assistants. Each subagent is crafted to excel in specific domains, from 
              backend architecture to crypto trading, providing developers with expert-level assistance 
              exactly when they need it.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-border/50">
                <div className="text-3xl font-bold text-primary mb-2">40+</div>
                <p className="text-sm text-muted-foreground">Specialized Subagents</p>
              </Card>
              <Card className="p-6 border-border/50">
                <div className="text-3xl font-bold text-primary mb-2">7</div>
                <p className="text-sm text-muted-foreground">Domain Categories</p>
              </Card>
              <Card className="p-6 border-border/50">
                <div className="text-3xl font-bold text-primary mb-2">Growing</div>
                <p className="text-sm text-muted-foreground">Community Contributors</p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* About the Creator */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">About the Creator</h2>
          <Card className="p-8 border-border/50 bg-card/50">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Code2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Dave Poon</h3>
                <p className="text-muted-foreground mb-4">
                  I&apos;m passionate about AI-assisted development and believe in empowering developers 
                  with specialized tools that enhance their productivity. The Claude Code Subagents 
                  Collection started as a personal project to organize domain-specific prompts and has 
                  grown into a community-driven resource.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/davepoon" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Vision & Roadmap */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Vision & Roadmap</h2>
          <div className="bg-primary/10 rounded-xl p-8 border border-primary/20 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Our Mission</h3>
            </div>
            <p className="text-muted-foreground">
              To build the most comprehensive resource hub for Claude Code users, providing not just 
              specialized subagents but a complete ecosystem of tools, tutorials, and community-driven 
              content that makes AI-assisted development accessible to everyone.
            </p>
          </div>
          
          <h3 className="text-xl font-semibold mb-6">Coming Soon: More Claude Code Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {futureResources.map((resource, i) => (
              <Card key={i} className="p-6 border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <resource.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{resource.title}</h4>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Get Involved */}
        <section>
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center max-w-2xl mx-auto">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
              <p className="text-muted-foreground mb-6">
                Whether you&apos;re a developer, designer, or AI enthusiast, there are many ways to 
                contribute to the Claude Code ecosystem. Join us in building the future of AI-assisted 
                development!
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="text-primary font-semibold">✨ Automatic Deployment:</span> All merged subagents are automatically deployed to this website within minutes. No manual deployment steps required!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="btn-gradient gap-2">
                    Contribute on GitHub
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a 
                  href="https://github.com/davepoon/claude-code-subagents-collection/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    Join the Discussion
                    <ArrowRight className="h-4 w-4" />
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