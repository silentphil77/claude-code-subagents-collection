'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Check, Terminal, Package, Zap, Settings, ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PackageManagerSwitcherProps {
  selected: 'npm' | 'yarn' | 'pnpm' | 'bun'
  onSelect: (pm: 'npm' | 'yarn' | 'pnpm' | 'bun') => void
}

function PackageManagerSwitcher({ selected, onSelect }: PackageManagerSwitcherProps) {
  const managers = ['npm', 'yarn', 'pnpm', 'bun'] as const
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-md w-fit mb-3">
      {managers.map((pm) => (
        <button
          key={pm}
          type="button"
          onClick={() => onSelect(pm)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-[0.25rem] transition-all
            ${selected === pm
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {pm}
        </button>
      ))}
    </div>
  )
}

interface TocItem {
  id: string
  title: string
  children?: TocItem[]
}

const tocItems: TocItem[] = [
  { id: 'installation', title: 'Installation' },
  { id: 'core-commands', title: 'Core Commands' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'configuration-scope', title: 'Configuration Scope Behavior' },
  { id: 'use-cases', title: 'Use Cases' },
  { 
    id: 'mcp-servers', 
    title: 'MCP Servers',
    children: [
      { id: 'mcp-provider-guide', title: 'Provider Selection Guide' },
      { id: 'mcp-docker', title: 'Docker MCP Servers' },
      { id: 'mcp-remote', title: 'Remote MCP Servers' },
      { id: 'mcp-multiple-providers', title: 'Using Multiple Providers' },
    ]
  },
  { id: 'mcp-verification', title: 'MCP Server Verification' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
  { id: 'next-steps', title: 'Next Steps' }
]

export default function CLIPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm' | 'bun'>('npm')
  const [activeSection, setActiveSection] = useState<string>('')
  
  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 90 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = tocItems.flatMap(item => 
        item.children ? [item.id, ...item.children.map(child => child.id)] : [item.id]
      )
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Package manager specific commands
  const getInstallCommand = (type: 'global' | 'dev' | 'dlx', pm: typeof packageManager) => {
    const commands = {
      global: {
        npm: 'npm install -g bwc-cli',
        yarn: 'yarn global add bwc-cli',
        pnpm: 'pnpm add -g bwc-cli',
        bun: 'bun add -g bwc-cli'
      },
      dev: {
        npm: 'npm install --save-dev bwc-cli',
        yarn: 'yarn add -D bwc-cli',
        pnpm: 'pnpm add -D bwc-cli',
        bun: 'bun add -d bwc-cli'
      },
      dlx: {
        npm: 'npx bwc-cli@latest',
        yarn: 'yarn dlx bwc-cli@latest',
        pnpm: 'pnpm dlx bwc-cli@latest',
        bun: 'bunx bwc-cli@latest'
      }
    }
    return commands[type][pm]
  }

  const getRunCommand = (script: string, pm: typeof packageManager) => {
    const runners = {
      npm: `npm run ${script}`,
      yarn: `yarn ${script}`,
      pnpm: `pnpm ${script}`,
      bun: `bun ${script}`
    }
    return runners[pm]
  }

  const commands = {
    // Installation
    globalInstall: 'npm install -g bwc-cli',
    npxUsage: 'npx bwc-cli@latest init',
    // Basic commands
    init: 'bwc init',
    initProject: 'bwc init --project',
    addAgent: 'bwc add --agent python-pro',
    addCommand: 'bwc add --command dockerize',
    addInteractive: 'bwc add',
    list: 'bwc list',
    listAgents: 'bwc list --agents',
    listInstalled: 'bwc list --installed',
    search: 'bwc search python',
    install: 'bwc install',
    status: 'bwc status',
    statusJson: 'bwc status --json',
    statusVerbose: 'bwc status --verbose --check',

    // MCP commands - Updated with explicit provider selection
    mcpList: 'bwc mcp list',
    mcpAddUser: 'bwc add --mcp postgres --docker-mcp',  // Explicit Docker flag
    mcpAddProject: 'bwc add --mcp postgres --docker-mcp --scope project',  // Docker with project scope
    mcpAddDocker: 'bwc add --mcp redis --docker-mcp',  // Docker MCP (containerized)
    mcpSetup: 'bwc add --setup',
    mcpWithEnv: 'bwc add --mcp postgres --docker-mcp --scope project -e DB_PASSWORD=secret API_KEY=abc123',
    mcpSearch: 'bwc mcp search database',
    mcpInfo: 'bwc mcp info postgres',
    mcpStatus: 'bwc mcp status',
    mcpRemoteSSE: 'bwc add --mcp linear-server --transport sse --url https://mcp.linear.app/sse --header "Authorization: Bearer token123"',  // Claude CLI (remote)
    mcpRemoteHTTP: 'bwc add --mcp http-service --transport http --url https://api.service.com/v1 --header "X-API-Key: key123"',  // Claude CLI (remote)
    mcpListScoped: `# List all servers
bwc mcp list

# List user-installed servers
bwc mcp list --user

# List project-installed servers
bwc mcp list --project`,

    // Configuration
    globalConfig: `{
  "version": "1.0",
  "registry": "https://buildwithclaude.com/registry.json",
  "paths": {
    "subagents": "~/.claude/agents/",
    "commands": "~/.claude/commands/"
  },
  "installed": {
    "subagents": ["python-pro", "react-wizard"],
    "commands": ["dockerize", "test-runner"]
  }
}`,
    projectConfig: `{
  "version": "1.0",
  "registry": "https://buildwithclaude.com/registry.json",
  "paths": {
    "subagents": ".claude/agents/",
    "commands": ".claude/commands/"
  },
  "installed": {
    "subagents": ["backend-architect", "database-admin"],
    "commands": ["api-tester", "dockerize"]
  }
}`,
    // Examples
    teamSetup: `# Initialize project configuration
bwc init --project

# Add project-specific subagents
bwc add --agent backend-architect
bwc add --agent database-admin
bwc add --command dockerize

# Commit configuration
git add bwc.config.json
git commit -m "Add Claude Code configuration"

# Team members install dependencies
git clone <repo>
bwc install`,
    bulkInstall: `# Search for testing-related tools
bwc search test

# Add multiple items interactively
bwc add
# Select "Subagent"
# Select category or "All"
# Use SPACE to select multiple items
# Press ENTER to install all`,
    cicdExample: `# .github/workflows/setup.yml
- name: Install bwc CLI
  run: npm install -g bwc-cli
  
- name: Install Claude dependencies
  run: bwc install`
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Table of Contents - Sticky Sidebar */}
        <nav className="hidden xl:block fixed right-[max(0px,calc(50%-45rem))] top-32 w-64 h-[calc(100vh-10rem)] overflow-y-auto">
          <div className="pl-4 pr-4 py-4 border-l border-border/50">
            <h3 className="font-semibold text-sm mb-4 text-foreground/60 uppercase tracking-wider">On this page</h3>
            <ul className="space-y-2 text-sm">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      block w-full text-left py-1 px-3 rounded-md transition-colors
                      hover:bg-muted/50
                      ${activeSection === item.id ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground'}
                    `}
                  >
                    {item.title}
                  </button>
                  {item.children && (
                    <ul className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(child.id)}
                            className={`
                              block w-full text-left py-0.5 px-2 rounded-md transition-colors text-xs
                              hover:bg-muted/50
                              ${activeSection === child.id ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground'}
                            `}
                          >
                            {child.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl">
          <Link href="/docs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Link>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">CLI Tool for Claude Code</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Add subagents and commands from your terminal with the bwc CLI
          </p>
          {/* Quick install */}
          <div className="bg-card p-6 rounded-lg border border-border/50 mb-8">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Install
            </h3>
            <div className="space-y-3">
              <PackageManagerSwitcher selected={packageManager} onSelect={setPackageManager} />
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{getInstallCommand('global', packageManager)}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(getInstallCommand('global', packageManager), 0)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 0 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Terminal className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Easy Installation</h3>
              <p className="text-sm text-muted-foreground">Install and manage subagents with simple commands</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Status Monitoring</h3>
              <p className="text-sm text-muted-foreground">Check config, installed items, and health status</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Package className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">MCP Servers</h3>
              <p className="text-sm text-muted-foreground">Connect to external tools with Docker MCP integration</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Project Config</h3>
              <p className="text-sm text-muted-foreground">Team-wide settings with version control</p>
            </div>
          </div>
        </div>

        {/* Installation Methods */}
        <section className="mb-12" id="installation">
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <Tabs defaultValue="npx" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="npx">npx (No Install)</TabsTrigger>
              <TabsTrigger value="project">Project level</TabsTrigger>
              <TabsTrigger value="user">User level</TabsTrigger>
            </TabsList>

            <TabsContent value="npx" className="space-y-4">
              <p className="text-muted-foreground">Use directly without installation</p>
              <PackageManagerSwitcher selected={packageManager} onSelect={setPackageManager} />
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Run any command with ${getInstallCommand('dlx', packageManager).split(' ')[0]}
${getInstallCommand('dlx', packageManager)} init
${getInstallCommand('dlx', packageManager)} add --agent python-pro
${getInstallCommand('dlx', packageManager)} list --agents`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(
                    `${getInstallCommand('dlx', packageManager)} init\n${getInstallCommand('dlx', packageManager)} add --agent python-pro\n${getInstallCommand('dlx', packageManager)} list --agents`,
                    1
                  )}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="project" className="space-y-4">
              <p className="text-muted-foreground">Install as a project dependency</p>
              <PackageManagerSwitcher selected={packageManager} onSelect={setPackageManager} />
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Add to project
${getInstallCommand('dev', packageManager)}

# Add to package.json scripts
"scripts": {
  "claude:init": "bwc init --project",
  "claude:install": "bwc install"
}

# Run with ${packageManager}
${getRunCommand('claude:init', packageManager)}`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(getInstallCommand('dev', packageManager), 2)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 2 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <p className="text-muted-foreground">Install for current user to use the CLI from anywhere</p>
              <PackageManagerSwitcher selected={packageManager} onSelect={setPackageManager} />
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Install for user (available in all projects)
${getInstallCommand('global', packageManager)}

# Verify installation
bwc --version

# Initialize user level configuration
bwc init`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`${getInstallCommand('global', packageManager)}\nbwc --version\nbwc init`, 3)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 3 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Core Commands */}
        <section className="mb-12" id="core-commands">
          <h2 className="text-2xl font-bold mb-4">Core Commands</h2>
          <div className="space-y-6">
            {/* init */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc init</h3>
              <p className="text-muted-foreground mb-3">Initialize configuration</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# Initialize user level configuration (default)
${commands.init}

# Initialize project-level configuration
${commands.initProject}

# ⚠️ With project config, all installations default to project scope`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`${commands.init}\n${commands.initProject}`, 4)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 4 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* add */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc add</h3>
              <p className="text-muted-foreground mb-3">Add subagents or commands (defaults to project if project config exists)</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# Add specific subagent
${commands.addAgent}

# Add specific command
${commands.addCommand}

# Interactive mode (browse and select)
${commands.addInteractive}

# Force user-level install (when project config exists)
bwc add --agent python-pro --user

# Force project-level install (requires project config)
bwc add --agent python-pro --project

# Add MCP server with explicit scope
bwc add --mcp postgres --scope project

# Add Docker MCP server (uses Docker MCP Toolkit)
${commands.mcpAddDocker}

# Setup Docker MCP gateway
${commands.mcpSetup}

# Add MCP server with environment variables
${commands.mcpWithEnv}`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`${commands.addAgent}\n${commands.addCommand}\n${commands.addInteractive}`, 5)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 5 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  💡 <strong>Interactive Mode:</strong> Use SPACE to select/deselect items, ENTER to confirm
                </p>
              </div>
            </div>

            {/* list */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc list</h3>
              <p className="text-muted-foreground mb-3">Browse available items</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# List all items
${commands.list}

# List subagents only
${commands.listAgents}

# Show installed items
${commands.listInstalled}

# Filter by category
bwc list --category language-specialists`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`${commands.list}\n${commands.listAgents}\n${commands.listInstalled}\nbwc list --category language-specialists`, 6)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 6 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* search */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc search</h3>
              <p className="text-muted-foreground mb-3">Search for subagents and commands</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# Search both subagents and commands
${commands.search}

# Search subagents only
bwc search python --agents

# Search commands only
bwc search docker --commands`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`${commands.search}\nbwc search python --agents\nbwc search docker --commands`, 7)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 7 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* status */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc status</h3>
              <p className="text-muted-foreground mb-3">Display current BWC configuration status and health</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# Show comprehensive status report
${commands.status}

# Verify actual MCP server installations
bwc status --verify-mcp

# Output in JSON format for scripting
${commands.statusJson}

# Verbose output with deep health checks
${commands.statusVerbose}

# Filter MCP servers by scope
bwc status --scope project
bwc status --scope user`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`${commands.status}\n${commands.statusJson}\n${commands.statusVerbose}`, 8)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 8 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  💡 <strong>Status Report includes:</strong> Config scope (project/user), installed items, Claude CLI status, Docker MCP status, health checks, and MCP server verification (with --verify-mcp)
                </p>
              </div>
            </div>

            {/* install */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">bwc install</h3>
              <p className="text-muted-foreground mb-3">Install all dependencies from configuration</p>
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-sm">{`# Install all items listed in config
${commands.install}

# Perfect for team onboarding:
# 1. Clone project with bwc.config.json
# 2. Run bwc install
# 3. All team members have same setup!`}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(commands.install, 9)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 9 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="mb-12" id="configuration">
          <h2 className="text-2xl font-bold mb-4">Configuration</h2>

          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Config</TabsTrigger>
              <TabsTrigger value="project">Project Config</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4">
              <p className="text-muted-foreground">Located at <code className="text-sm bg-muted px-2 py-1 rounded">~/.bwc/config.json</code> - Available across all your projects</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.globalConfig}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.globalConfig, 10)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 10 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              <p className="text-muted-foreground">Located at <code className="text-sm bg-muted px-2 py-1 rounded">./bwc.config.json</code> - Makes all installations default to project scope</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.projectConfig}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.projectConfig, 11)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 11 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                💡 Add <code>.claude/</code> to your <code>.gitignore</code> to avoid committing installed files
              </p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Configuration Scope Behavior */}
        <section className="mb-12" id="configuration-scope">
          <h2 className="text-2xl font-bold mb-4">Configuration Scope Behavior</h2>

          <div className="bg-card p-6 rounded-lg border border-border/50 mb-6">
            <h3 className="font-semibold mb-3">🎯 Default Installation Behavior</h3>
            <div className="space-y-2 text-sm">
              <p>• <strong>With project config</strong> (<code className="bg-muted px-1 rounded">./bwc.config.json</code>): All installations go to <code className="bg-muted px-1 rounded">.claude/agents/</code> and <code className="bg-muted px-1 rounded">.claude/commands/</code></p>
              <p>• <strong>Without project config</strong>: Installations go to user level (<code className="bg-muted px-1 rounded">~/.claude/agents/</code> and <code className="bg-muted px-1 rounded">~/.claude/commands/</code>)</p>
              <p>• <strong>MCP servers</strong>: Always require explicit <code className="bg-muted px-1 rounded">--scope</code> parameter</p>
            </div>
            <div className="mt-4 p-3 bg-background/50 rounded-md">
              <code className="text-xs">{`# After running: bwc init --project
bwc add --agent python-pro      # → ./claude/agents/
bwc add --command dockerize     # → ./claude/commands/
bwc add --mcp postgres --scope project  # Explicit scope needed
bwc add --agent rust-pro --user        # Override to user level
bwc add --agent golang-pro --project   # Force project level`}</code>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12" id="use-cases">
          <h2 className="text-2xl font-bold mb-4">Use Cases</h2>

          <div className="space-y-6">
            {/* Team Setup */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Team Onboarding</h3>
              <p className="text-muted-foreground mb-3">Scaffold your Claude Code setup with your team</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.teamSetup}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.teamSetup, 12)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 12 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Bulk Operations */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Bulk Installation</h3>
              <p className="text-muted-foreground mb-3">Add multiple items at once</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.bulkInstall}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.bulkInstall, 13)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 13 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* CI/CD */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">CI/CD Integration</h3>
              <p className="text-muted-foreground mb-3">Automate Claude Code setup in your pipelines</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.cicdExample}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.cicdExample, 14)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 14 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MCP Servers Section */}
        <section className="mb-12" id="mcp-servers">
          <h2 className="text-2xl font-bold mb-4">🔌 MCP Servers</h2>
          <p className="text-muted-foreground mb-6">
            Connect Claude Code to external tools and services through MCP (Model Context Protocol)
          </p>

          {/* Provider Selection Guide */}
          <div id="mcp-provider-guide" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              🎯 Provider Selection Guide
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              BWC supports multiple MCP providers. Choose the right one for your needs:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-background/60 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  🐳 Docker MCP Provider
                </h4>
                <p className="text-sm text-muted-foreground mb-3">For containerized, locally-running servers</p>
                <div className="bg-background/50 p-2 rounded text-xs font-mono mb-2">
                  bwc add --mcp &lt;name&gt; --docker-mcp
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✅ Secure container isolation</li>
                  <li>✅ Pre-configured servers from Docker Hub</li>
                  <li>✅ Automatic lifecycle management</li>
                  <li>⚠️ Requires Docker Desktop</li>
                </ul>
              </div>
              
              <div className="bg-background/60 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  🌐 Claude CLI Provider
                </h4>
                <p className="text-sm text-muted-foreground mb-3">For remote APIs and cloud services</p>
                <div className="bg-background/50 p-2 rounded text-xs font-mono mb-2">
                  bwc add --mcp &lt;name&gt; --transport sse --url &lt;url&gt;
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✅ Connect to any HTTP/SSE endpoint</li>
                  <li>✅ Custom authentication headers</li>
                  <li>✅ No Docker requirement</li>
                  <li>⚠️ Requires network connectivity</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-sm">
                <strong>⚠️ Important:</strong> The <code className="bg-background/50 px-1 rounded">--docker-mcp</code> flag is <strong>required</strong> to use Docker MCP. 
                Without it, BWC will attempt to use Claude CLI.
              </p>
            </div>
          </div>

          {/* Provider Comparison Table */}
          <div className="border border-border/50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3">📊 Provider Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Feature</th>
                    <th className="text-left p-2">🐳 Docker MCP</th>
                    <th className="text-left p-2">🌐 Claude CLI</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2 font-medium">Command Syntax</td>
                    <td className="p-2"><code className="text-xs bg-muted px-1 rounded">--docker-mcp</code></td>
                    <td className="p-2"><code className="text-xs bg-muted px-1 rounded">--transport --url</code></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Server Location</td>
                    <td className="p-2">Local containers</td>
                    <td className="p-2">Remote endpoints</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Requirements</td>
                    <td className="p-2">Docker Desktop</td>
                    <td className="p-2">Network connectivity</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Best For</td>
                    <td className="p-2">Databases, file systems, dev tools</td>
                    <td className="p-2">APIs, cloud services, SaaS tools</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Security</td>
                    <td className="p-2">Container isolation</td>
                    <td className="p-2">HTTPS + Auth headers</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Examples</td>
                    <td className="p-2">postgres, redis, filesystem</td>
                    <td className="p-2">Linear, GitHub API, OpenAI</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Docker MCP Integration */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Docker MCP Toolkit Integration
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              BWC CLI integrates with Docker MCP Toolkit for secure, containerized MCP servers.
            </p>
            <div className="space-y-2 text-sm">
              <p>🎯 <strong>Explicit selection:</strong> Use <code className="bg-background/50 px-1 rounded">--docker-mcp</code> flag to select Docker provider</p>
              <p>🔒 <strong>Container isolation:</strong> Each server runs in a secure container</p>
              <p>🚀 <strong>Simple management:</strong> Pre-configured servers from Docker Hub</p>
              <p>🔑 <strong>Secure secrets:</strong> Docker Desktop manages all API keys</p>
            </div>
            <div className="mt-4 p-3 bg-background/50 rounded-md">
              <code className="text-xs">{`# Setup Docker MCP gateway (one-time)
${commands.mcpSetup}

# Add Docker MCP server (--docker-mcp flag is REQUIRED)
${commands.mcpAddDocker}

# Check Docker MCP status
bwc status --verbose`}</code>
            </div>
            <div className="mt-3 p-2 bg-blue-500/10 rounded-md">
              <p className="text-xs">
                <strong>💡 Note:</strong> Docker MCP is no longer automatically selected. You must explicitly use the <code className="bg-background/50 px-1 rounded">--docker-mcp</code> flag to install Docker-based servers.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Interactive Mode */}
            <div className="border border-purple-500/50 rounded-lg p-6 bg-purple-500/5">
              <h3 className="font-semibold mb-2">🎮 Interactive Mode Provider Selection</h3>
              <p className="text-muted-foreground mb-3">When Docker MCP is available, interactive mode lets you choose your provider</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Run interactive mode
bwc add

# If Docker MCP is available, you'll see:
? What would you like to add?
> MCP Server

? Select MCP provider:
> Docker MCP (containerized local servers)    # Choose for local servers
  Claude CLI (remote servers via SSE/HTTP)    # Choose for remote APIs

# Based on your selection:
# - Docker MCP: Lists available Docker servers
# - Claude CLI: Prompts for server name, URL, transport`}</code>
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                💡 <strong>Tip:</strong> If Docker isn't available, BWC automatically uses the registry.
              </p>
            </div>

            {/* Quick Start */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <p className="text-muted-foreground mb-3">Get started with MCP servers using explicit commands</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Browse available MCP servers
${commands.mcpList}

# Install Docker MCP server (requires --docker-mcp flag)
${commands.mcpAddUser}

# Install for project only (team sharing)
${commands.mcpAddProject}

# Search for specific functionality
${commands.mcpSearch}

# View server details
${commands.mcpInfo}`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`${commands.mcpList}\n${commands.mcpAddUser}\n${commands.mcpAddProject}\n${commands.mcpSearch}\n${commands.mcpInfo}`, 15)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 15 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Docker MCP Servers */}
            <div id="mcp-docker" className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Docker MCP Servers</h3>
              <p className="text-muted-foreground mb-3">Use Docker MCP for containerized, locally-running MCP servers</p>
              
              <div className="space-y-4">
                {/* Setup */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">🚀 Setup Docker MCP Gateway</h4>
                  <p className="text-sm text-muted-foreground mb-3">One-time setup to configure Docker MCP in Claude Code</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`# Setup Docker MCP gateway
${commands.mcpSetup}

# This configures Claude Code to use Docker MCP gateway
# Restart Claude Code after setup`}</code>
                  </pre>
                </div>

                {/* Adding Docker Servers */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📦 Add Docker MCP Servers</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Install containerized MCP servers from Docker Hub
                    <span className="text-amber-500 ml-2">(--docker-mcp flag is required!)</span>
                  </p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`# ⚠️ IMPORTANT: --docker-mcp flag is REQUIRED for Docker servers
bwc add --mcp postgres --docker-mcp
bwc add --mcp redis --docker-mcp --scope project
bwc add --mcp mongodb --docker-mcp --scope user

# Without --docker-mcp, BWC will try to find the server in registry
# bwc add --mcp postgres  # ❌ This will NOT use Docker MCP!

# List available Docker MCP servers
docker mcp list

# Check which servers are running
docker mcp status`}</code>
                  </pre>
                </div>

                {/* Popular Docker Servers */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">🐳 Popular Docker MCP Servers</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                    <code className="text-xs bg-background/60 p-2 rounded">postgres</code>
                    <code className="text-xs bg-background/60 p-2 rounded">redis</code>
                    <code className="text-xs bg-background/60 p-2 rounded">mongodb</code>
                    <code className="text-xs bg-background/60 p-2 rounded">elasticsearch</code>
                    <code className="text-xs bg-background/60 p-2 rounded">mysql</code>
                    <code className="text-xs bg-background/60 p-2 rounded">sqlite</code>
                    <code className="text-xs bg-background/60 p-2 rounded">github</code>
                    <code className="text-xs bg-background/60 p-2 rounded">gitlab</code>
                    <code className="text-xs bg-background/60 p-2 rounded">filesystem</code>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 rounded-md">
                <p className="text-sm">
                  <strong>📋 Prerequisites:</strong> Docker Desktop must be installed and running.
                  <a href="https://docker.com/products/docker-desktop" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-primary hover:underline ml-2">
                    Download Docker Desktop →
                  </a>
                </p>
              </div>
            </div>

            {/* Installation Scopes */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">MCP Server Installation Scopes</h3>
              <p className="text-muted-foreground mb-4">Control where and how MCP servers are configured</p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📍 Local Scope</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Default scope</li>
                    <li>• Current project only</li>
                    <li>• Not shared with team</li>
                    <li>• Personal configurations</li>
                  </ul>
                  <pre className="mt-3 p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">bwc add --mcp redis --scope local</code>
                  </pre>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">👤 User Scope</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Available across all projects</li>
                    <li>• Personal settings</li>
                    <li>• Not shared with team</li>
                    <li>• Stored in ~/.bwc/config.json</li>
                  </ul>
                  <pre className="mt-3 p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">bwc add --mcp supabase --scope user</code>
                  </pre>
                </div>

                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">👥 Project Scope</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Configuration in version control</li>
                    <li>• Team members use same servers</li>
                    <li>• Shared configuration</li>
                    <li>• Stored in ./bwc.config.json</li>
                  </ul>
                  <pre className="mt-3 p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">bwc add --mcp postgres --scope project</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <p className="text-muted-foreground mb-3">Configure MCP servers with environment variables for API keys and secrets</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Add MCP server with environment variables
${commands.mcpWithEnv}

# Multiple environment variables
bwc add --mcp openai --scope project \\
  -e OPENAI_API_KEY=sk-... \\
  -e OPENAI_ORG_ID=org-...

# Environment variables are stored securely:
# - Project scope: Stored in .mcp.json (add to .gitignore!)
# - User/Local scope: Managed by Claude CLI or Docker Desktop`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.mcpWithEnv, 18)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 18 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground bg-amber-500/10 p-3 rounded-md mt-3">
                ⚠️ <strong>Security Note:</strong> Never commit API keys to version control. Use environment variables or secrets management tools.
              </p>
            </div>

            {/* Using Multiple MCP Providers */}
            <div id="mcp-multiple-providers" className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">🔄 Using Multiple MCP Providers</h3>
              <p className="text-muted-foreground mb-3">BWC supports multiple MCP providers in the same project - mix and match as needed!</p>
              
              <div className="space-y-4">
                {/* Provider Selection */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">🎯 How Provider Selection Works</h4>
                  <p className="text-sm text-muted-foreground mb-3">BWC selects providers based on your command flags:</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`# Docker MCP: Use --docker-mcp flag
bwc add --mcp postgres --docker-mcp              # ✅ Uses Docker
bwc add --mcp redis --docker-mcp --scope project # ✅ Uses Docker

# Claude CLI: Use --transport and --url flags
bwc add --mcp api-server --transport sse --url https://api.example.com  # ✅ Uses Claude CLI
bwc add --mcp rest-api --transport http --url https://api.service.com   # ✅ Uses Claude CLI

# Registry: No provider flags (searches registry)
bwc add --mcp some-server                        # 🔍 Searches registry

# Example: Mixed providers in same project
bwc add --mcp postgres --docker-mcp              # Local database via Docker
bwc add --mcp redis --docker-mcp                 # Cache via Docker
bwc add --mcp linear-server --transport sse \\    # Project management via Claude CLI
  --url https://mcp.linear.app/sse \\
  --header "Authorization: Bearer $LINEAR_API_KEY"`}</code>
                  </pre>
                </div>

                {/* When to Use Each Provider */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">🐳 Use Docker MCP For:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Local databases (PostgreSQL, Redis, MongoDB)</li>
                      <li>• File system operations</li>
                      <li>• Development tools</li>
                      <li>• Services requiring container isolation</li>
                      <li>• Pre-configured MCP servers from Docker Hub</li>
                    </ul>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">🌐 Use Claude CLI For:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Remote REST APIs</li>
                      <li>• SSE streaming endpoints</li>
                      <li>• Cloud services (AWS, Azure, GCP)</li>
                      <li>• Custom company APIs</li>
                      <li>• Services with complex authentication</li>
                    </ul>
                  </div>
                </div>

                {/* Mixed Configuration Example */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📦 Mixed Provider Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-3">Example of using both providers in bwc.config.json</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`{
  "installed": {
    "mcpServers": {
      "postgres": {
        "provider": "docker",      // Docker MCP provider
        "transport": "stdio",
        "scope": "project"
      },
      "redis": {
        "provider": "docker",      // Docker MCP provider
        "transport": "stdio",
        "scope": "project"
      },
      "company-api": {
        "provider": "claude",      // Claude CLI provider
        "transport": "sse",
        "url": "https://api.company.com/sse",
        "headers": {
          "Authorization": "Bearer token"
        },
        "scope": "user"
      },
      "rest-service": {
        "provider": "claude",      // Claude CLI provider
        "transport": "http",
        "url": "https://api.service.com/v1",
        "headers": {
          "X-API-Key": "key123"
        },
        "scope": "project"
      }
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-500/10 rounded-md">
                <p className="text-sm">
                  <strong>✅ Best Practices for Mixed Providers:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Use Docker MCP for development infrastructure (databases, caches)</li>
                  <li>• Use Claude CLI for external APIs and cloud services</li>
                  <li>• Check provider status with <code className="bg-muted px-1 rounded">bwc status --verbose</code></li>
                  <li>• Docker servers start automatically with Docker Desktop</li>
                  <li>• Remote servers require network connectivity</li>
                </ul>
              </div>
            </div>

            {/* Remote MCP Servers */}
            <div id="mcp-remote" className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Remote MCP Servers (Claude CLI)</h3>
              <p className="text-muted-foreground mb-3">Connect to remote MCP servers via SSE (Server-Sent Events) or HTTP APIs using Claude CLI</p>
              
              <div className="space-y-4">
                {/* SSE Transport */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📡 SSE Transport (Real-time Streaming)</h4>
                  <p className="text-sm text-muted-foreground mb-3">For servers that support Server-Sent Events for real-time communication</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`# Connect to SSE endpoint
${commands.mcpRemoteSSE}

# With multiple headers for authentication
bwc add --mcp streaming-api --scope user \\
  --transport sse \\
  --url https://api.example.com/v2/sse \\
  --header "Authorization: Bearer token" \\
  --header "X-Client-ID: client123"`}</code>
                  </pre>
                </div>

                {/* HTTP Transport */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">🌐 HTTP Transport (REST APIs)</h4>
                  <p className="text-sm text-muted-foreground mb-3">For traditional HTTP/REST API endpoints</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`# Connect to HTTP endpoint
${commands.mcpRemoteHTTP}

# With custom headers and authentication
bwc add --mcp rest-service --scope project \\
  --transport http \\
  --url https://api.company.com/mcp \\
  --header "X-API-Key: secret-key" \\
  --header "Content-Type: application/json"`}</code>
                  </pre>
                </div>

                {/* Configuration in bwc.config.json */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📝 Configuration Storage</h4>
                  <p className="text-sm text-muted-foreground mb-3">How remote servers are stored in your configuration</p>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`// bwc.config.json
{
  "installed": {
    "mcpServers": {
      "remote-api": {
        "provider": "claude",
        "transport": "sse",
        "url": "https://api.example.com/sse",
        "headers": {
          "Authorization": "Bearer token123"
        },
        "scope": "user"
      },
      "http-service": {
        "provider": "claude",
        "transport": "http",
        "url": "https://api.service.com/v1",
        "headers": {
          "X-API-Key": "key123"
        },
        "scope": "project"
      }
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 rounded-md">
                <p className="text-sm">
                  <strong>💡 Tips for Remote Servers:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Use HTTPS endpoints for secure communication</li>
                  <li>• Store sensitive tokens in environment variables</li>
                  <li>• SSE is ideal for real-time, streaming responses</li>
                  <li>• HTTP is suitable for request-response patterns</li>
                  <li>• Test connectivity with <code className="bg-muted px-1 rounded">bwc status --verbose</code></li>
                </ul>
              </div>

             
            </div>

            {/* Example Workflow: Mixed Providers */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">💡 Example: Full-Stack Project with Mixed Providers</h3>
              <p className="text-muted-foreground mb-3">Real-world example using both Docker MCP and Claude CLI providers</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# 1. Setup project configuration
bwc init --project

# 2. Add local development infrastructure (Docker MCP)
# ⚠️ Note: --docker-mcp flag is REQUIRED for each Docker server
bwc add --mcp postgres --docker-mcp --scope project     # Database
bwc add --mcp redis --docker-mcp --scope project        # Cache
bwc add --mcp filesystem --docker-mcp --scope project   # File operations

# 3. Add external APIs (Claude CLI for remote servers)
# Use --transport and --url for remote servers
bwc add --mcp linear-server --transport sse \\
  --url https://mcp.linear.app/sse \\
  --header "Authorization: Bearer $LINEAR_API_KEY" \\
  --scope project

bwc add --mcp github-api --transport http \\
  --url https://api.github.com \\
  --header "Authorization: Bearer $GITHUB_TOKEN" \\
  --scope project

# 4. Check all configured servers
bwc status --verbose

# Output shows mixed providers:
# 🔌 MCP Servers (5 installed):
#   ✓ postgres      [project]  docker/stdio    ✅
#   ✓ redis         [project]  docker/stdio    ✅
#   ✓ filesystem    [project]  docker/stdio    ✅
#   ✓ linear-server [project]  claude/sse      ✅
#   ✓ github-api    [project]  claude/http     ✅

# 5. Team members can install everything with one command
git clone <repo>
bwc install  # Automatically installs both Docker and Claude CLI servers`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`bwc init --project\nbwc add --mcp postgres --docker-mcp --scope project\nbwc add --mcp redis --docker-mcp --scope project`, 22)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 22 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground mb-3">Share MCP servers with your team</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Team lead sets up project MCP servers
bwc init --project
bwc add --mcp postgres --scope project
bwc add --mcp github --scope project

# Commit configuration
git add bwc.config.json
git commit -m "Add team MCP servers"

# Team members clone and install
git clone <repo>
bwc install  # Installs all configured MCP servers`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`bwc init --project\nbwc add --mcp postgres --scope project\nbwc add --mcp github --scope project\ngit add bwc.config.json\ngit commit -m "Add team MCP servers"`, 20)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 20 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* List and Search */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">List and Search MCP Servers</h3>
              <p className="text-muted-foreground mb-3">Find and manage installed servers</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.mcpListScoped}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.mcpListScoped, 21)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 21 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* MCP Server Providers */}
            <div className="bg-card p-6 rounded-lg border border-border/50">
              <h3 className="font-semibold mb-3">MCP Server Providers</h3>
              <p className="text-sm text-muted-foreground mb-4">BWC supports multiple MCP server providers for maximum flexibility</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🐳</span>
                  <div>
                    <h4 className="font-medium">Docker MCP</h4>
                    <p className="text-sm text-muted-foreground">Containerized servers with secure isolation</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-medium">Claude CLI</h4>
                    <p className="text-sm text-muted-foreground">Native integration with Claude Code</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h4 className="font-medium">NPM Packages</h4>
                    <p className="text-sm text-muted-foreground">Install servers from npm registry</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                BWC automatically detects available providers and uses the best option for each server.
              </p>
            </div>

            {/* Popular Servers */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Popular MCP Servers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">redis</code>
                  <p className="text-xs text-muted-foreground mt-1">Database operations</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">github</code>
                  <p className="text-xs text-muted-foreground mt-1">GitHub API</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">context7</code>
                  <p className="text-xs text-muted-foreground mt-1">Contextual AI</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">stripe</code>
                  <p className="text-xs text-muted-foreground mt-1">Payments</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">slack</code>
                  <p className="text-xs text-muted-foreground mt-1">Team chat</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">notion</code>
                  <p className="text-xs text-muted-foreground mt-1">Knowledge base</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">atlassian</code>
                  <p className="text-xs text-muted-foreground mt-1">Issue tracking</p>
                </div>
                <div className="bg-background/50 p-3 rounded-md">
                  <code className="text-sm font-medium">elastic</code>
                  <p className="text-xs text-muted-foreground mt-1">Search & analytics</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                View all 100+ servers at{' '}
                <Link href="/mcp-servers" className="text-primary hover:underline">
                  buildwithclaude.com/mcp-servers
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* MCP Server Verification */}
        <section className="mb-12" id="mcp-verification">
          <h2 className="text-2xl font-bold mb-4">🔍 MCP Server Verification</h2>
          <p className="text-muted-foreground mb-6">
            The <code className="text-sm bg-muted px-2 py-1 rounded">--verify-mcp</code> flag performs deep verification of MCP server installations
          </p>

          <div className="space-y-6">
            {/* Basic vs Verified Status */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Basic vs Verified Status</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Basic Status (Fast)</h4>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`bwc status

# Shows configuration-based status
# ✓ Quick check
# ✓ No external calls
# ✓ Shows what's in config files`}</code>
                  </pre>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Verified Status (Thorough)</h4>
                  <pre className="p-3 rounded-md bg-background/60 overflow-x-auto">
                    <code className="text-sm">{`bwc status --verify-mcp

# Verifies actual installations
# ✓ Checks Claude CLI servers
# ✓ Checks Docker MCP servers
# ✓ Tests connectivity
# ✓ Shows fix commands`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Verification Output Example */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Example Verification Output</h3>
              <p className="text-muted-foreground mb-3">When servers are configured but not actually installed</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`$ bwc status --verify-mcp

🔌 MCP Servers (3 configured, verification enabled):
  ⚠️ postgres       [project] docker/stdio   GATEWAY NOT CONFIGURED
  ⚠️ redis          [user]    docker/stdio   NOT INSTALLED  
  ✅ linear-server  [project] claude/sse     Connected

📋 MCP Verification Issues Found:
  
  postgres:
    Issue: Docker MCP gateway not configured in Claude CLI
    Fix:   1. Run: bwc add --setup
           2. Restart Claude Code
           3. Then: docker mcp server add postgres
  
  redis:
    Issue: Server not installed in Docker MCP
    Fix:   docker mcp server add redis`}</code>
                </pre>
              </div>
            </div>

            {/* Status Icons Explained */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Verification Status Icons</h3>
              <div className="space-y-2">
                <p>✅ <strong>Connected/Installed:</strong> Server is properly installed and working</p>
                <p>⚠️ <strong>NOT INSTALLED:</strong> Configured in BWC but not in Claude CLI or Docker MCP</p>
                <p>⚠️ <strong>GATEWAY NOT CONFIGURED:</strong> Docker gateway needs setup via <code className="bg-muted px-1 rounded">bwc add --setup</code></p>
                <p>❌ <strong>Error:</strong> Connection or configuration error</p>
              </div>
            </div>

            {/* Common Issues and Fixes */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Common Issues and Fixes</h3>
              <div className="space-y-4">
                <div className="bg-amber-500/10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Docker Gateway Not Configured</h4>
                  <p className="text-sm text-muted-foreground mb-2">The verification shows Docker servers need the gateway</p>
                  <pre className="p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">{`# Fix in order:
1. bwc add --setup           # Setup Docker MCP gateway
2. Restart Claude Code       # Activate the gateway
3. docker mcp server add <name>  # Install the server`}</code>
                  </pre>
                </div>
                
                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Claude CLI Server Not Found</h4>
                  <p className="text-sm text-muted-foreground mb-2">Remote servers configured but not in Claude CLI</p>
                  <pre className="p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">{`# For SSE servers:
claude mcp add <name> --transport sse --url <url>

# For HTTP servers:
claude mcp add <name> --transport http --url <url>`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* When to Use Verification */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">When to Use MCP Verification</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ MCP servers appear configured but don't work in Claude Code</li>
                <li>✓ After team member clones project with <code className="bg-muted px-1 rounded">bwc.config.json</code></li>
                <li>✓ Debugging "server not found" errors</li>
                <li>✓ Verifying Docker gateway setup</li>
                <li>✓ Checking remote server connectivity</li>
              </ul>
            </div>
          </div>
        </section>

        {/* MCP Server Verification */}
        <section className="mb-12" id="mcp-verification">
          <h2 className="text-2xl font-bold mb-4">🔍 MCP Server Verification</h2>
          <p className="text-muted-foreground mb-6">
            Verify that your MCP servers are properly installed and configured with the <code className="bg-muted px-1 rounded">--verify-mcp</code> flag.
          </p>

          <div className="space-y-4">
            {/* How it works */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">How Verification Works</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The <code className="bg-muted px-1 rounded">bwc status --verify-mcp</code> command performs deep verification of your MCP server installations:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• ✅ Checks if servers are configured in BWC</li>
                <li>• ✅ Verifies actual installation in Claude Code</li>
                <li>• ✅ Detects missing or misconfigured servers</li>
                <li>• ✅ Provides fix commands for issues</li>
                <li>• ✅ Reminds about Docker gateway setup when needed</li>
              </ul>
            </div>

            {/* Usage example */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Using MCP Verification</h3>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Basic status check
bwc status

# Deep MCP server verification
bwc status --verify-mcp

# JSON output for scripting
bwc status --verify-mcp --json`}</code>
                </pre>
              </div>
            </div>

            {/* Example output */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Example Verification Output</h3>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`✓ BWC Configuration Status

Configuration: /path/to/project/bwc.config.json (project)

📦 Installed Items:
  Subagents: 3
  Commands: 2
  MCP Servers: 5

🔌 MCP Server Verification:
  ✓ postgres (Docker) - Installed and configured
  ✓ redis (Docker) - Installed and configured
  ✓ linear-server (SSE) - Configured in .mcp.json
  ⚠ github (Docker) - Not installed
    Fix: bwc add --mcp github --docker-mcp
    Note: Run 'bwc add --setup' to configure Docker gateway if needed
  ⚠ api-server (HTTP) - Missing from .mcp.json
    Fix: bwc add --mcp api-server --transport http --url https://api.example.com --scope project`}</code>
                </pre>
              </div>
            </div>

            {/* Common issues */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Common Verification Issues</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Docker gateway not configured:</strong>
                  <p className="text-muted-foreground">Run <code className="bg-muted px-1 rounded">bwc add --setup</code> to configure the Docker MCP gateway</p>
                </div>
                <div>
                  <strong>Server missing from .mcp.json:</strong>
                  <p className="text-muted-foreground">Remote servers need to be in .mcp.json for team sharing. Re-add with <code className="bg-muted px-1 rounded">--scope project</code></p>
                </div>
                <div>
                  <strong>Docker server not enabled:</strong>
                  <p className="text-muted-foreground">Use the provided fix command to enable the server in Docker MCP</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12" id="troubleshooting">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>

          <div className="space-y-4">
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Configuration not found</h3>
              <p className="text-muted-foreground">Run <code className="text-sm bg-muted px-2 py-1 rounded">bwc init</code> to create configuration</p>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Check configuration status</h3>
              <p className="text-muted-foreground">Run <code className="text-sm bg-muted px-2 py-1 rounded">bwc status --verbose</code> to see detailed configuration and health information</p>
            </div>
            
            {/* Provider-specific issues */}
            <div className="border border-amber-500/50 rounded-lg p-4 bg-amber-500/5">
              <h3 className="font-semibold mb-2 text-amber-600">Can't add remote server when Docker is available</h3>
              <p className="text-muted-foreground mb-2">This issue has been fixed! BWC no longer automatically selects Docker MCP.</p>
              <p className="text-sm text-muted-foreground">
                <strong>Solution:</strong> Use explicit flags to select your provider:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• For Docker: <code className="bg-muted px-1 rounded">bwc add --mcp postgres --docker-mcp</code></li>
                <li>• For Remote: <code className="bg-muted px-1 rounded">bwc add --mcp api --transport sse --url https://...</code></li>
              </ul>
            </div>
            
            <div className="border border-blue-500/50 rounded-lg p-4 bg-blue-500/5">
              <h3 className="font-semibold mb-2 text-blue-600">Provider selection confusion</h3>
              <p className="text-muted-foreground mb-2">Not sure which provider BWC is using?</p>
              <ul className="text-sm space-y-1">
                <li>• Run <code className="bg-muted px-1 rounded">bwc status --verbose</code> to see provider for each server</li>
                <li>• Look for <code className="bg-muted px-1 rounded">docker/stdio</code> or <code className="bg-muted px-1 rounded">claude/sse</code> in the output</li>
                <li>• Check your <code className="bg-muted px-1 rounded">bwc.config.json</code> for the "provider" field</li>
              </ul>
            </div>
            
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Docker MCP not working</h3>
              <p className="text-muted-foreground mb-2">Ensure Docker Desktop is running. Run <code className="text-sm bg-muted px-2 py-1 rounded">bwc add --setup</code> to configure the Docker MCP gateway</p>
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> Always use <code className="bg-muted px-1 rounded">--docker-mcp</code> flag when adding Docker servers!
              </p>
            </div>
            
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Remote MCP server connection failed</h3>
              <p className="text-muted-foreground">For remote servers via Claude CLI:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Verify the URL is accessible: <code className="bg-muted px-1 rounded">curl -I &lt;url&gt;</code></li>
                <li>• Check authentication headers are correct</li>
                <li>• Ensure Claude CLI is installed: <code className="bg-muted px-1 rounded">npm install -g @anthropic/claude-cli</code></li>
                <li>• Use <code className="bg-muted px-1 rounded">--transport sse</code> or <code className="bg-muted px-1 rounded">--transport http</code> as appropriate</li>
              </ul>
            </div>
            
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">MCP servers from old version</h3>
              <p className="text-muted-foreground">BWC automatically migrates legacy MCP server configurations. Old string arrays are converted to the new format with 'docker' as the default provider</p>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Failed to fetch registry</h3>
              <p className="text-muted-foreground">Check your internet connection. The CLI needs access to <code className="text-sm bg-muted px-2 py-1 rounded">buildwithclaude.com</code></p>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Permission denied</h3>
              <p className="text-muted-foreground">On macOS/Linux, you may need to use <code className="text-sm bg-muted px-2 py-1 rounded">sudo npm install -g bwc-cli</code></p>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Interactive mode not selecting</h3>
              <p className="text-muted-foreground">Use <strong>SPACE</strong> to select items (not Enter). Selected items show a ● marker. Press <strong>ENTER</strong> only to confirm.</p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section id="next-steps">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <div className="bg-card p-6 rounded-lg border border-border/50">
            <div className="space-y-3">
              <Link href="/browse" className="flex items-center text-primary hover:underline">
                → Browse available subagents
              </Link>
              <Link href="/commands" className="flex items-center text-primary hover:underline">
                → Explore slash commands
              </Link>
              <Link href="/mcp-servers" className="flex items-center text-primary hover:underline">
                → Browse MCP servers
              </Link>
              <Link href="/contribute" className="flex items-center text-primary hover:underline">
                → Contribute your own subagents
              </Link>
              <a href="https://github.com/davepoon/claude-code-subagents-collection/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline">
                → Report issues or suggest features
              </a>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}