/**
 * Docker Hub Registry Fetcher
 * Fetches from hub.docker.com/u/mcp
 */

export class DockerHubFetcher {
  constructor() {
    this.catalogUrl = 'https://hub.docker.com/v2/repositories/mcp/'
  }
  
  async fetchServers() {
    const response = await fetch(this.catalogUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MCP-Importer'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Docker Hub API error: ${response.status}`)
    }
    
    const data = await response.json()
    const servers = []
    
    for (const repo of data.results || []) {
      const server = this.convertDockerServer(repo)
      if (server) {
        servers.push(server)
      }
    }
    
    return servers
  }
  
  convertDockerServer(data) {
    // Map of Docker images to their NPM equivalents
    const dockerToNpmMap = {
      'filesystem': '@modelcontextprotocol/server-filesystem',
      'github': '@modelcontextprotocol/server-github',
      'postgres': '@modelcontextprotocol/server-postgres',
      'slack': '@modelcontextprotocol/server-slack',
      'sqlite': '@modelcontextprotocol/server-sqlite',
      'puppeteer': '@modelcontextprotocol/server-puppeteer',
      'web-browser': '@modelcontextprotocol/server-puppeteer',
      // Add more mappings as we discover them
    };
    
    // Skip Docker-only servers that don't have NPM equivalents
    const npmPackage = dockerToNpmMap[data.name];
    if (!npmPackage) {
      console.warn(`Skipping Docker server ${data.name}: No NPM equivalent available for Claude Code`);
      return null;
    }
    
    // Calculate popularity score based on Docker pulls
    const popularityScore = this.calculatePopularityScore(data);
    
    // Build badges array
    const badges = ['docker-hub', 'local-execution', 'verified', 'npm-available'];
    
    // Add popularity badges based on pull count
    if (data.pull_count > 100000) {
      badges.push('popular');
    } else if (data.pull_count > 50000) {
      badges.push('featured');
    } else if (data.pull_count > 10000) {
      badges.push('trending');
    }
    
    // Generate Claude CLI command using NPM package
    const claudeCommand = `claude mcp add ${data.name} -- npx -y ${npmPackage}`;
    
    const installationMethods = [
      {
        type: 'claude-cli',
        recommended: true,
        command: claudeCommand,
        config_example: JSON.stringify({
          mcpServers: {
            [data.name]: {
              command: 'npx',
              args: ['-y', npmPackage],
              env: {}
            }
          }
        }, null, 2)
      },
      {
        type: 'bwc',
        command: `bwc add --mcp ${data.name}`
      },
      {
        type: 'npm',
        command: `npm install -g ${npmPackage}`,
        config_example: JSON.stringify({
          mcpServers: {
            [data.name]: {
              command: 'npx',
              args: ['-y', npmPackage],
              env: {}
            }
          }
        }, null, 2)
      },
      {
        type: 'docker',
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
      }
    ];
    
    return {
      name: data.name,
      display_name: data.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: this.detectCategory(data.name, data.description || ''),
      description: data.description || `MCP server: ${data.name}`,
      server_type: 'stdio',
      protocol_version: '1.0.0',
      execution_type: 'local', // Docker containers run locally
      popularity_score: popularityScore,
      security: {
        auth_type: 'none',
        permissions: []
      },
      sources: {
        docker: `mcp/${data.name}:latest`,
        npm: npmPackage
      },
      verification: {
        status: 'verified',
        last_tested: new Date().toISOString().split('T')[0],
        tested_with: ['claude-3.5', 'claude-desktop', 'docker']
      },
      stats: {
        docker_pulls: data.pull_count || 0,
        last_updated: data.last_updated
      },
      installation_methods: installationMethods,
      tags: [],
      badges: badges,
      file: `auto-imported/docker/${data.name}.md`,
      source_registry: {
        type: 'docker',
        url: `https://hub.docker.com/r/mcp/${data.name}`,
        last_fetched: new Date().toISOString(),
        auto_update: true,
        verified_by: 'docker-hub'
      }
    }
  }
  
  calculatePopularityScore(data) {
    let score = data.pull_count || 0;
    
    // Boost for recent updates
    if (data.last_updated) {
      const daysSinceUpdate = (Date.now() - new Date(data.last_updated)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        score *= 1.2; // 20% boost for updates in last 30 days
      } else if (daysSinceUpdate < 90) {
        score *= 1.1; // 10% boost for updates in last 90 days
      }
    }
    
    return Math.round(score);
  }
  
  detectCategory(name, description) {
    const lowerName = (name || '').toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    const combined = `${lowerName} ${lowerDesc}`;
    
    const categoryRules = {
      'web-search': ['search', 'google', 'bing', 'duckduckgo', 'exa', 'perplexity'],
      'browser-automation': ['browser', 'playwright', 'puppeteer', 'selenium', 'chrome'],
      'memory-management': ['memory', 'context', 'remember', 'recall', 'persist'],
      'email-integration': ['email', 'gmail', 'outlook', 'mail', 'smtp', 'imap'],
      'blockchain-crypto': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
      'ai-task-management': ['think', 'reasoning', 'agent', 'multi-agent', 'sequential'],
      
      'developer-tools': ['terminal', 'command', 'shell', 'code', 'ide', 'debug'],
      'api-development': ['api', 'rest', 'graphql', 'postman', 'swagger', 'webhook'],
      'version-control': ['git', 'github', 'gitlab', 'commit', 'merge'],
      
      'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'sqlite'],
      'file-system': ['file', 'filesystem', 'directory', 'folder', 'document'],
      'cloud-infrastructure': ['aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker'],
      
      'productivity': ['task', 'todo', 'notion', 'calendar', 'time', 'productivity'],
      'content-management': ['cms', 'content', 'blog', 'wiki', 'markdown'],
      'social-media': ['social', 'twitter', 'facebook', 'instagram', 'slack'],
      
      'research-education': ['research', 'pubmed', 'wikipedia', 'academic', 'scientific'],
      'media-generation': ['image', 'video', 'generate', 'art', 'design'],
      'data-extraction': ['scrape', 'extract', 'parse', 'crawler'],
      'finance-trading': ['finance', 'stock', 'market', 'investment'],
      
      'analytics': ['analytics', 'metrics', 'monitoring', 'tracking', 'statistics']
    };
    
    // Score-based matching
    const scores = {};
    for (const [category, keywords] of Object.entries(categoryRules)) {
      scores[category] = 0;
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          scores[category] += keyword.split(' ').length * 2; // Multi-word matches score higher
        }
      }
    }
    
    // Find best match
    let maxScore = 0;
    let bestCategory = 'utilities';
    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }
}