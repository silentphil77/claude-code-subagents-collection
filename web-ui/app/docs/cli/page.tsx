'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Check, Terminal, Package, Zap, Settings, ArrowLeft } from 'lucide-react'
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

export default function CLIPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm' | 'bun'>('npm')
  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

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

    // MCP commands
    mcpList: 'bwc mcp list',
    mcpAddUser: 'bwc add --mcp postgres',
    mcpAddProject: 'bwc add --mcp postgres --project',
    mcpSearch: 'bwc mcp search database',
    mcpInfo: 'bwc mcp info postgres',
    mcpStatus: 'bwc mcp status',
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
      <div className="container mx-auto px-4 max-w-4xl">
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
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Terminal className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Easy Installation</h3>
              <p className="text-sm text-muted-foreground">Install and manage subagents with simple commands</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Bulk Operations</h3>
              <p className="text-sm text-muted-foreground">Add multiple items at once with interactive mode</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Project Config</h3>
              <p className="text-sm text-muted-foreground">Team-wide settings with version control</p>
            </div>
          </div>
        </div>

        {/* Installation Methods */}
        <section className="mb-12">
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
        <section className="mb-12">
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
bwc add --agent python-pro --global
# Or use the --user flag (same effect)
bwc add --agent python-pro --user`}</code>
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
                    onClick={() => copyToClipboard(commands.install, 8)}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="ghost"
                  >
                    {copiedIndex === 8 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="mb-12">
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
                  onClick={() => copyToClipboard(commands.globalConfig, 9)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 9 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  onClick={() => copyToClipboard(commands.projectConfig, 10)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 10 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                💡 Add <code>.claude/</code> to your <code>.gitignore</code> to avoid committing installed files
              </p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Configuration Scope Behavior */}
        <section className="mb-12">
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
bwc add --agent rust-pro --global      # Override to user level
bwc add --agent golang-pro --user      # Same as --global`}</code>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Use Cases</h2>

          <div className="space-y-6">
            {/* Team Setup */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Team Onboarding</h3>
              <p className="text-muted-foreground mb-3">Share your Claude Code setup with your team</p>
              <div className="relative">
                <pre className="p-4 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{commands.teamSetup}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(commands.teamSetup, 11)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 11 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  onClick={() => copyToClipboard(commands.bulkInstall, 12)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 12 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  onClick={() => copyToClipboard(commands.cicdExample, 13)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 13 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MCP Servers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🔌 MCP Servers (Docker Gateway)</h2>
          <p className="text-muted-foreground mb-6">
            Connect Claude to 100+ external tools through secure Docker containers
          </p>

          {/* Prerequisites */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>Prerequisites:</strong> Docker Desktop is required for MCP servers.{' '}
              <a href="https://docker.com/products/docker-desktop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline">
                Download Docker Desktop →
              </a>
            </p>
          </div>

          <div className="space-y-6">
            {/* Quick Start */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <p className="text-muted-foreground mb-3">Get started with MCP servers in seconds</p>
              <div className="relative">
                <pre className="p-3 rounded-md bg-background/50 overflow-x-auto">
                  <code className="text-sm">{`# Browse available MCP servers
${commands.mcpList}

# Install for current user (all projects)
${commands.mcpAddUser}

# Install for project only (team sharing)
${commands.mcpAddProject}

# Search for specific functionality
${commands.mcpSearch}

# View server details
${commands.mcpInfo}`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`${commands.mcpList}\n${commands.mcpAddUser}\n${commands.mcpAddProject}\n${commands.mcpSearch}\n${commands.mcpInfo}`, 14)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 14 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Installation Scopes */}
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Installation Scopes</h3>
              <p className="text-muted-foreground mb-4">Choose where to install MCP servers</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">👤 User Scope</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Location: <code className="bg-muted px-1 rounded">~/.bwc/config.json</code> (under installed.mcpServers)</li>
                    <li>• Available across all projects</li>
                    <li>• Personal API keys in Docker Desktop</li>
                    <li>• Not shared with team</li>
                    <li>• Default when no project config exists</li>
                  </ul>
                  <pre className="mt-3 p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">bwc add --mcp supabase</code>
                  </pre>
                </div>

                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">👥 Project Scope</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Location: <code className="bg-muted px-1 rounded">./bwc.config.json</code></li>
                    <li>• Current project only</li>
                    <li>• Configuration in version control</li>
                    <li>• Team members use same servers</li>
                    <li>• Requires explicit <code className="bg-muted px-1 rounded">--scope project</code></li>
                  </ul>
                  <pre className="mt-3 p-2 rounded-md bg-background/50 overflow-x-auto">
                    <code className="text-xs">bwc add --mcp postgres --project</code>
                  </pre>
                </div>
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
bwc add --mcp postgres --project
bwc add --mcp github --project

# Commit configuration
git add bwc.config.json
git commit -m "Add team MCP servers"

# Team members clone and install
git clone <repo>
bwc install  # Installs all configured MCP servers`}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(`bwc init --project\nbwc add --mcp postgres --project\nbwc add --mcp github --project\ngit add bwc.config.json\ngit commit -m "Add team MCP servers"`, 15)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 15 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  onClick={() => copyToClipboard(commands.mcpListScoped, 16)}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copiedIndex === 16 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Why Docker Only */}
            <div className="bg-card p-6 rounded-lg border border-border/50">
              <h3 className="font-semibold mb-3">Why Docker MCP Gateway Only?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h4 className="font-medium">Container Isolation</h4>
                    <p className="text-sm text-muted-foreground">Complete system protection</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <h4 className="font-medium">Secure Secrets</h4>
                    <p className="text-sm text-muted-foreground">Docker manages all API keys</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium">Verified Images</h4>
                    <p className="text-sm text-muted-foreground">All servers signed by Docker</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h4 className="font-medium">Single Gateway</h4>
                    <p className="text-sm text-muted-foreground">One secure endpoint for all</p>
                  </div>
                </div>
              </div>
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

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>

          <div className="space-y-4">
            <div className="border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Configuration not found</h3>
              <p className="text-muted-foreground">Run <code className="text-sm bg-muted px-2 py-1 rounded">bwc init</code> to create configuration</p>
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
        <section>
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
  )
}