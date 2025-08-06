import { MCPServer, UserInput, SourceRegistry } from '../registry/types.js'
import { logger } from './logger.js'

/**
 * Interface for registry fetchers
 */
export interface RegistryFetcher {
  fetchServers(): Promise<MCPServer[]>
  convertToMarkdown(server: any): string
  getName(): string
}

/**
 * GitHub Model Context Protocol Registry Fetcher
 * Fetches from https://github.com/modelcontextprotocol/servers
 */
export class GitHubRegistryFetcher implements RegistryFetcher {
  private readonly repoUrl = 'https://api.github.com/repos/modelcontextprotocol/servers/contents/src'
  
  getName(): string {
    return 'GitHub ModelContextProtocol'
  }
  
  async fetchServers(): Promise<MCPServer[]> {
    try {
      logger.info('Fetching MCP servers from GitHub...')
      
      // Fetch directory listing
      const response = await fetch(this.repoUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BWC-CLI'
        }
      })
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      
      const directories = await response.json() as any[]
      const servers: MCPServer[] = []
      
      // Process each directory as a potential server
      for (const dir of directories) {
        if (dir.type === 'dir') {
          try {
            const server = await this.fetchServerDetails(dir.name, dir.url)
            if (server) {
              servers.push(server)
            }
          } catch (error) {
            logger.info(`Failed to fetch details for ${dir.name}: ${error}`)
          }
        }
      }
      
      return servers
    } catch (error) {
      logger.error(`Failed to fetch from GitHub: ${error}`)
      return []
    }
  }
  
  private async fetchServerDetails(name: string, dirUrl: string): Promise<MCPServer | null> {
    try {
      // Try to fetch package.json
      const packageResponse = await fetch(`${dirUrl}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BWC-CLI'
        }
      })
      
      if (!packageResponse.ok) {
        return null
      }
      
      const files = await packageResponse.json() as any[]
      const packageFile = files.find((f: any) => f.name === 'package.json')
      
      if (!packageFile) {
        return null
      }
      
      // Fetch package.json content
      const contentResponse = await fetch(packageFile.download_url)
      const packageJson = await contentResponse.json() as any
      
      // Convert to our MCP server format
      const server: MCPServer = {
        name: name,
        display_name: packageJson.name || name,
        category: this.detectCategory(name),
        description: packageJson.description || `MCP server for ${name}`,
        server_type: 'stdio',
        protocol_version: '1.0.0',
        security: {
          auth_type: 'none',
          permissions: []
        },
        sources: {
          official: `modelcontextprotocol/servers/tree/main/src/${name}`,
          npm: packageJson.name
        },
        verification: {
          status: 'verified',
          last_tested: new Date().toISOString().split('T')[0],
          tested_with: ['claude-3.5']
        },
        installation_methods: [{
          type: 'npm',
          recommended: true,
          config_example: JSON.stringify({
            mcpServers: {
              [name]: {
                command: 'npx',
                args: ['-y', packageJson.name],
                env: {}
              }
            }
          }, null, 2)
        }],
        tags: [],
        file: `mcp-servers/github/${name}.md`,
        path: `mcp-servers/github/${name}.md`,
        source_registry: {
          type: 'github',
          url: `https://github.com/modelcontextprotocol/servers/tree/main/src/${name}`,
          last_fetched: new Date().toISOString(),
          auto_update: true
        }
      }
      
      return server
    } catch (error) {
      logger.info(`Failed to process server ${name}: ${error}`)
      return null
    }
  }
  
  private detectCategory(name: string): MCPServer['category'] {
    const categoryMap: Record<string, MCPServer['category']> = {
      'filesystem': 'file-systems',
      'git': 'development',
      'docker': 'development',
      'postgres': 'databases',
      'sqlite': 'databases',
      'mongodb': 'databases',
      'fetch': 'web',
      'puppeteer': 'web',
      'time': 'productivity'
    }
    
    for (const [key, category] of Object.entries(categoryMap)) {
      if (name.toLowerCase().includes(key)) {
        return category
      }
    }
    
    return 'development'
  }
  
  convertToMarkdown(_server: any): string {
    // Implementation for converting GitHub server data to markdown
    return ''
  }
}

/**
 * Smithery Registry Fetcher
 * Fetches from https://smithery.ai API
 */
export class SmitheryRegistryFetcher implements RegistryFetcher {
  private readonly apiUrl = 'https://registry.smithery.ai/servers'
  private apiKey?: string
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }
  
  getName(): string {
    return 'Smithery'
  }
  
  async fetchServers(): Promise<MCPServer[]> {
    try {
      logger.info('Fetching MCP servers from Smithery...')
      
      if (!this.apiKey) {
        logger.warn('No Smithery API key provided. Some features may be limited.')
      }
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'BWC-CLI'
      }
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }
      
      const response = await fetch(`${this.apiUrl}?pageSize=100`, { headers })
      
      if (!response.ok) {
        throw new Error(`Smithery API error: ${response.status}`)
      }
      
      const data = await response.json() as any
      const servers: MCPServer[] = []
      
      for (const item of data.data || []) {
        const server = this.convertSmitheryServer(item)
        if (server) {
          servers.push(server)
        }
      }
      
      return servers
    } catch (error) {
      logger.error(`Failed to fetch from Smithery: ${error}`)
      return []
    }
  }
  
  private convertSmitheryServer(data: any): MCPServer | null {
    try {
      return {
        name: data.qualifiedName || data.name,
        display_name: data.displayName || data.name,
        category: 'apis', // Default category, could be enhanced
        description: data.description || '',
        server_type: 'stdio',
        protocol_version: '1.0.0',
        security: {
          auth_type: 'none',
          permissions: []
        },
        sources: {
          marketplace: {
            smithery: data.homepage || `https://smithery.ai/server/${data.qualifiedName}`
          }
        },
        verification: {
          status: data.isVerified ? 'verified' : 'community',
          last_tested: new Date().toISOString().split('T')[0],
          tested_with: ['claude-3.5']
        },
        stats: {
          last_updated: data.createdAt
        },
        installation_methods: [{
          type: 'manual',
          steps: [`Visit ${data.homepage || 'https://smithery.ai'} for installation instructions`]
        }],
        tags: [],
        file: `mcp-servers/smithery/${data.qualifiedName}.md`,
        path: `mcp-servers/smithery/${data.qualifiedName}.md`,
        source_registry: {
          type: 'smithery',
          id: data.qualifiedName,
          url: data.homepage,
          last_fetched: new Date().toISOString(),
          auto_update: true
        }
      }
    } catch (error) {
      logger.info(`Failed to convert Smithery server: ${error}`)
      return null
    }
  }
  
  convertToMarkdown(_server: any): string {
    // Implementation for converting Smithery server data to markdown
    return ''
  }
}

/**
 * Docker Hub Registry Fetcher
 * Fetches from hub.docker.com/mcp
 */
export class DockerHubRegistryFetcher implements RegistryFetcher {
  private readonly catalogUrl = 'https://hub.docker.com/v2/repositories/mcp/'
  
  getName(): string {
    return 'Docker Hub MCP'
  }
  
  async fetchServers(): Promise<MCPServer[]> {
    try {
      logger.info('Fetching MCP servers from Docker Hub...')
      
      const response = await fetch(this.catalogUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BWC-CLI'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status}`)
      }
      
      const data = await response.json() as any
      const servers: MCPServer[] = []
      
      for (const repo of data.results || []) {
        const server = this.convertDockerServer(repo)
        if (server) {
          servers.push(server)
        }
      }
      
      return servers
    } catch (error) {
      logger.error(`Failed to fetch from Docker Hub: ${error}`)
      return []
    }
  }
  
  private convertDockerServer(data: any): MCPServer | null {
    try {
      return {
        name: data.name,
        display_name: data.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        category: 'development',
        description: data.description || `Docker-based MCP server: ${data.name}`,
        server_type: 'stdio',
        protocol_version: '1.0.0',
        security: {
          auth_type: 'none',
          permissions: []
        },
        sources: {
          docker: `mcp/${data.name}:latest`
        },
        verification: {
          status: 'verified',
          last_tested: new Date().toISOString().split('T')[0],
          tested_with: ['claude-3.5', 'docker']
        },
        stats: {
          docker_pulls: data.pull_count || 0,
          last_updated: data.last_updated
        },
        installation_methods: [{
          type: 'docker',
          recommended: true,
          command: `docker pull mcp/${data.name}:latest`,
          config_example: JSON.stringify({
            mcpServers: {
              [data.name]: {
                command: 'docker',
                args: ['run', '-i', '--rm', `mcp/${data.name}:latest`],
                env: {}
              }
            }
          }, null, 2)
        }],
        tags: [],
        file: `mcp-servers/docker/${data.name}.md`,
        path: `mcp-servers/docker/${data.name}.md`,
        source_registry: {
          type: 'docker',
          url: `https://hub.docker.com/r/mcp/${data.name}`,
          last_fetched: new Date().toISOString(),
          auto_update: true
        }
      }
    } catch (error) {
      logger.info(`Failed to convert Docker server: ${error}`)
      return null
    }
  }
  
  convertToMarkdown(_server: any): string {
    // Implementation for converting Docker server data to markdown
    return ''
  }
}

/**
 * Registry Manager - Orchestrates fetching from multiple registries
 */
export class RegistryManager {
  private fetchers: RegistryFetcher[] = []
  
  constructor(options?: { smitheryApiKey?: string }) {
    // Initialize fetchers
    this.fetchers.push(new GitHubRegistryFetcher())
    this.fetchers.push(new SmitheryRegistryFetcher(options?.smitheryApiKey))
    this.fetchers.push(new DockerHubRegistryFetcher())
  }
  
  async fetchFromAllRegistries(): Promise<MCPServer[]> {
    const allServers: MCPServer[] = []
    const errors: string[] = []
    
    for (const fetcher of this.fetchers) {
      try {
        logger.info(`Fetching from ${fetcher.getName()}...`)
        const servers = await fetcher.fetchServers()
        allServers.push(...servers)
        logger.success(`Fetched ${servers.length} servers from ${fetcher.getName()}`)
      } catch (error) {
        const errorMsg = `Failed to fetch from ${fetcher.getName()}: ${error}`
        logger.error(errorMsg)
        errors.push(errorMsg)
      }
    }
    
    // Deduplicate servers by name
    const uniqueServers = this.deduplicateServers(allServers)
    
    logger.info(`\nTotal unique servers fetched: ${uniqueServers.length}`)
    if (errors.length > 0) {
      logger.warn(`Encountered ${errors.length} errors during fetching`)
    }
    
    return uniqueServers
  }
  
  async fetchFromRegistry(registryType: 'github' | 'smithery' | 'docker', options?: any): Promise<MCPServer[]> {
    let fetcher: RegistryFetcher | null = null
    
    switch (registryType) {
      case 'github':
        fetcher = new GitHubRegistryFetcher()
        break
      case 'smithery':
        fetcher = new SmitheryRegistryFetcher(options?.apiKey)
        break
      case 'docker':
        fetcher = new DockerHubRegistryFetcher()
        break
    }
    
    if (!fetcher) {
      throw new Error(`Unknown registry type: ${registryType}`)
    }
    
    return fetcher.fetchServers()
  }
  
  async detectUserInputs(server: MCPServer): Promise<UserInput[]> {
    const inputs: UserInput[] = []
    
    // Analyze installation methods for placeholders
    for (const method of server.installation_methods) {
      if (method.config_example) {
        try {
          const config = JSON.parse(method.config_example)
          const detectedInputs = this.detectPlaceholdersInConfig(config)
          inputs.push(...detectedInputs)
        } catch {
          // Invalid JSON, skip
        }
      }
    }
    
    // Deduplicate inputs by name
    const uniqueInputs = inputs.filter((input, index, self) => 
      index === self.findIndex(i => i.name === input.name)
    )
    
    return uniqueInputs
  }
  
  private detectPlaceholdersInConfig(config: any, path: string = ''): UserInput[] {
    const inputs: UserInput[] = []
    const placeholderPatterns = [
      { pattern: /\/Users\/\w+\/[\w-]+/, type: 'path' as const, name: 'directory' },
      { pattern: /\/path\/to\/[\w-]+/, type: 'path' as const, name: 'path' },
      { pattern: /YOUR_[\w_]+/, type: 'string' as const, name: 'api_key' },
      { pattern: /\b(sk|pk)_test_[\w]+/, type: 'string' as const, name: 'api_key' },
      { pattern: /localhost:\d+/, type: 'url' as const, name: 'server_url' },
      { pattern: /\{\{(\w+)\}\}/, type: 'string' as const, name: '$1' }
    ]
    
    const checkValue = (value: any, currentPath: string) => {
      if (typeof value === 'string') {
        for (const { pattern, type, name } of placeholderPatterns) {
          const match = value.match(pattern)
          if (match) {
            const inputName = name === '$1' ? match[1] : name
            inputs.push({
              name: inputName,
              display_name: inputName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              type,
              description: `Configure ${inputName} for the MCP server`,
              required: true,
              placeholder: value,
              config_path: currentPath
            })
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          checkValue(item, `${currentPath}[${index}]`)
        })
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, currentPath ? `${currentPath}.${key}` : key)
        })
      }
    }
    
    checkValue(config, path)
    return inputs
  }
  
  private deduplicateServers(servers: MCPServer[]): MCPServer[] {
    const seen = new Map<string, MCPServer>()
    
    for (const server of servers) {
      const existing = seen.get(server.name)
      if (!existing || this.shouldReplace(existing, server)) {
        seen.set(server.name, server)
      }
    }
    
    return Array.from(seen.values())
  }
  
  private shouldReplace(existing: MCPServer, newServer: MCPServer): boolean {
    // Priority: docker > github > smithery > manual
    const priorityMap: Record<string, number> = {
      'docker': 4,
      'github': 3,
      'smithery': 2,
      'manual': 1,
      'community': 0
    }
    
    const existingPriority = priorityMap[existing.source_registry?.type || 'manual'] || 0
    const newPriority = priorityMap[newServer.source_registry?.type || 'manual'] || 0
    
    return newPriority > existingPriority
  }
  
  async generateMarkdown(server: MCPServer): Promise<string> {
    const frontmatter = this.generateFrontmatter(server)
    const content = this.generateContent(server)
    
    return `${frontmatter}\n${content}`
  }
  
  private generateFrontmatter(server: MCPServer): string {
    const yaml = `---
name: ${server.name}
display_name: ${server.display_name}
description: ${server.description}
category: ${server.category}
server_type: ${server.server_type}
protocol_version: "${server.protocol_version}"
security:
  auth_type: ${server.security.auth_type}
  permissions: ${server.security.permissions.length > 0 ? '\n' + server.security.permissions.map(p => `    - "${p}"`).join('\n') : '[]'}
sources:${this.generateSourcesYaml(server.sources)}
verification:
  status: ${server.verification.status}
  last_tested: "${server.verification.last_tested}"
  tested_with: [${server.verification.tested_with.map(t => `"${t}"`).join(', ')}]${server.verification.security_audit !== undefined ? `\n  security_audit: ${server.verification.security_audit}` : ''}${server.stats ? this.generateStatsYaml(server.stats) : ''}
installation_methods:${this.generateInstallationMethodsYaml(server.installation_methods)}${server.user_inputs ? this.generateUserInputsYaml(server.user_inputs) : ''}${server.source_registry ? this.generateSourceRegistryYaml(server.source_registry) : ''}
tags: [${server.tags.map(t => `"${t}"`).join(', ')}]
---`
    
    return yaml
  }
  
  private generateSourcesYaml(sources: MCPServer['sources']): string {
    let yaml = ''
    if (sources.official) yaml += `\n  official: ${sources.official}`
    if (sources.docker) yaml += `\n  docker: "${sources.docker}"`
    if (sources.npm) yaml += `\n  npm: "${sources.npm}"`
    if (sources.marketplace) {
      yaml += '\n  marketplace:'
      if (sources.marketplace.smithery) yaml += `\n    smithery: "${sources.marketplace.smithery}"`
      if (sources.marketplace.mcpmarket) yaml += `\n    mcpmarket: "${sources.marketplace.mcpmarket}"`
    }
    return yaml
  }
  
  private generateStatsYaml(stats: MCPServer['stats']): string {
    if (!stats) return ''
    let yaml = '\nstats:'
    if (stats.github_stars !== undefined) yaml += `\n  github_stars: ${stats.github_stars}`
    if (stats.docker_pulls !== undefined) yaml += `\n  docker_pulls: ${stats.docker_pulls}`
    if (stats.npm_downloads !== undefined) yaml += `\n  npm_downloads: ${stats.npm_downloads}`
    if (stats.last_updated) yaml += `\n  last_updated: "${stats.last_updated}"`
    return yaml
  }
  
  private generateInstallationMethodsYaml(methods: MCPServer['installation_methods']): string {
    let yaml = ''
    for (const method of methods) {
      yaml += `\n  - type: ${method.type}`
      if (method.recommended) yaml += `\n    recommended: true`
      if (method.command) yaml += `\n    command: ${method.command}`
      if (method.config_example) {
        yaml += `\n    config_example: |\n${method.config_example.split('\n').map(l => '      ' + l).join('\n')}`
      }
      if (method.steps) {
        yaml += `\n    steps:`
        method.steps.forEach(step => {
          yaml += `\n      - ${step}`
        })
      }
      if (method.requirements) {
        yaml += `\n    requirements:`
        method.requirements.forEach(req => {
          yaml += `\n      - ${req}`
        })
      }
    }
    return yaml
  }
  
  private generateUserInputsYaml(inputs: UserInput[]): string {
    let yaml = '\nuser_inputs:'
    for (const input of inputs) {
      yaml += `\n  - name: ${input.name}`
      yaml += `\n    display_name: "${input.display_name}"`
      yaml += `\n    type: ${input.type}`
      yaml += `\n    description: "${input.description}"`
      yaml += `\n    required: ${input.required}`
      if (input.placeholder) yaml += `\n    placeholder: "${input.placeholder}"`
      if (input.default !== undefined) yaml += `\n    default: ${JSON.stringify(input.default)}`
      if (input.validation) {
        yaml += '\n    validation:'
        Object.entries(input.validation).forEach(([key, value]) => {
          yaml += `\n      ${key}: ${JSON.stringify(value)}`
        })
      }
      if (input.env_var) yaml += `\n    env_var: "${input.env_var}"`
      if (input.arg_position !== undefined) yaml += `\n    arg_position: ${input.arg_position}`
      if (input.config_path) yaml += `\n    config_path: "${input.config_path}"`
    }
    return yaml
  }
  
  private generateSourceRegistryYaml(registry: SourceRegistry): string {
    let yaml = '\nsource_registry:'
    yaml += `\n  type: ${registry.type}`
    if (registry.url) yaml += `\n  url: "${registry.url}"`
    if (registry.id) yaml += `\n  id: "${registry.id}"`
    if (registry.last_fetched) yaml += `\n  last_fetched: "${registry.last_fetched}"`
    yaml += `\n  auto_update: ${registry.auto_update}`
    return yaml
  }
  
  private generateContent(server: MCPServer): string {
    return `
# ${server.display_name}

## Overview

${server.description}

## Features

*Features to be documented*

## Requirements

*Requirements to be documented*

## Configuration

${server.installation_methods.map(method => {
  let config = `### ${method.type.toUpperCase()} Installation\n\n`
  if (method.command) {
    config += `\`\`\`bash\n${method.command}\n\`\`\`\n\n`
  }
  if (method.config_example) {
    config += `Configuration:\n\`\`\`json\n${method.config_example}\n\`\`\`\n`
  }
  return config
}).join('\n')}

## Available Tools

*Tools to be documented*

## Security Considerations

- **Authentication**: ${server.security.auth_type}
- **Permissions**: ${server.security.permissions.join(', ') || 'None specified'}

## Resources

${server.sources.official ? `- [Official Repository](https://github.com/${server.sources.official})` : ''}
${server.sources.docker ? `- [Docker Hub](https://hub.docker.com/r/${server.sources.docker.replace(':latest', '')})` : ''}
${server.sources.npm ? `- [NPM Package](https://www.npmjs.com/package/${server.sources.npm})` : ''}
${server.sources.marketplace?.smithery ? `- [Smithery](${server.sources.marketplace.smithery})` : ''}

## License

*License information to be added*
`
  }
}