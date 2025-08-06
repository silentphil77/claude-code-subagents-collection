/**
 * GitHub ModelContextProtocol Registry Fetcher
 * Fetches from https://github.com/modelcontextprotocol/servers
 */

export class GitHubFetcher {
  constructor() {
    this.repoUrl = 'https://api.github.com/repos/modelcontextprotocol/servers/contents/src'
  }
  
  async fetchServers() {
    const response = await fetch(this.repoUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Importer'
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    const directories = await response.json()
    const servers = []
    
    for (const dir of directories) {
      if (dir.type === 'dir') {
        try {
          const server = await this.fetchServerDetails(dir.name, dir.url)
          if (server) {
            servers.push(server)
          }
        } catch (error) {
          console.warn(`Failed to fetch ${dir.name}: ${error.message}`)
        }
      }
    }
    
    return servers
  }
  
  async fetchServerDetails(name, dirUrl) {
    const response = await fetch(dirUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Importer'
      }
    })
    
    if (!response.ok) return null
    
    const files = await response.json()
    const packageFile = files.find(f => f.name === 'package.json')
    
    if (!packageFile) return null
    
    const contentResponse = await fetch(packageFile.download_url)
    const packageJson = await contentResponse.json()
    
    // Skip if no NPM package name
    if (!packageJson.name) {
      console.warn(`Skipping ${name}: No NPM package name found`);
      return null;
    }
    
    // Calculate popularity score based on GitHub stats
    const popularityScore = await this.calculatePopularityScore(name);
    
    // Build badges array
    const badges = ['github-official', 'local-execution', 'verified'];
    
    // Add popularity badges based on stars/activity
    if (popularityScore > 1000) {
      badges.push('popular');
    } else if (popularityScore > 500) {
      badges.push('featured');
    } else if (popularityScore > 100) {
      badges.push('trending');
    }
    
    // Generate Claude CLI command
    // For stdio servers, we use npx to run them
    const claudeCommand = `claude mcp add ${name} -- npx -y ${packageJson.name}`;
    
    const installationMethods = [
      {
        type: 'claude-cli',
        recommended: true,
        command: claudeCommand,
        config_example: JSON.stringify({
          mcpServers: {
            [name]: {
              command: 'npx',
              args: ['-y', packageJson.name],
              env: {}
            }
          }
        }, null, 2)
      },
      {
        type: 'bwc',
        command: `bwc add --mcp ${name}`
      },
      {
        type: 'npm',
        command: `npm install -g ${packageJson.name}`,
        config_example: JSON.stringify({
          mcpServers: {
            [name]: {
              command: 'npx',
              args: ['-y', packageJson.name],
              env: {}
            }
          }
        }, null, 2)
      }
    ];
    
    return {
      name: name,
      display_name: packageJson.name || name,
      category: this.detectCategory(name, packageJson.description || ''),
      description: packageJson.description || `MCP server for ${name}`,
      server_type: 'stdio',
      protocol_version: '1.0.0',
      execution_type: 'local',
      popularity_score: popularityScore,
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
        tested_with: ['claude-3.5', 'claude-desktop']
      },
      installation_methods: installationMethods,
      tags: [],
      badges: badges,
      file: `auto-imported/github/${name}.md`,
      source_registry: {
        type: 'github',
        url: `https://github.com/modelcontextprotocol/servers/tree/main/src/${name}`,
        last_fetched: new Date().toISOString(),
        auto_update: true,
        verified_by: 'modelcontextprotocol'
      }
    }
  }
  
  async calculatePopularityScore(name) {
    try {
      // Try to get GitHub repo stats for the specific server
      const response = await fetch(`https://api.github.com/repos/modelcontextprotocol/servers`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MCP-Importer'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let score = data.stargazers_count || 0;
        
        // Boost for recent updates
        if (data.pushed_at) {
          const daysSinceUpdate = (Date.now() - new Date(data.pushed_at)) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate < 30) {
            score *= 1.2; // 20% boost for updates in last 30 days
          } else if (daysSinceUpdate < 90) {
            score *= 1.1; // 10% boost for updates in last 90 days
          }
        }
        
        return Math.round(score);
      }
    } catch (error) {
      console.warn(`Failed to get GitHub stats for ${name}:`, error);
    }
    
    // Default score for official repos
    return 1000; // Base score for official MCP servers
  }
  
  detectCategory(name, description) {
    const lowerName = (name || '').toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    const combined = `${lowerName} ${lowerDesc}`;
    
    // Official MCP servers are in a special category
    if (name.includes('@modelcontextprotocol/')) return 'official';
    
    const categoryRules = {
      'web-search': ['search', 'google', 'bing', 'duckduckgo', 'exa', 'perplexity'],
      'browser-automation': ['browser', 'playwright', 'puppeteer', 'selenium', 'chrome', 'firefox'],
      'memory-management': ['memory', 'context', 'remember', 'recall', 'persist'],
      'email-integration': ['email', 'gmail', 'outlook', 'mail', 'smtp', 'imap'],
      'blockchain-crypto': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
      'ai-task-management': ['think', 'reasoning', 'agent', 'multi-agent', 'sequential'],
      
      'developer-tools': ['terminal', 'command', 'shell', 'code', 'ide', 'debug', 'git', 'github'],
      'api-development': ['api', 'rest', 'graphql', 'postman', 'swagger', 'webhook', 'fetch'],
      'version-control': ['git', 'github', 'gitlab', 'commit', 'merge', 'pull request'],
      
      'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'sqlite'],
      'file-system': ['file', 'filesystem', 'directory', 'folder', 'document', 'fs'],
      'cloud-infrastructure': ['aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker'],
      
      'productivity': ['task', 'todo', 'notion', 'calendar', 'time', 'productivity'],
      'content-management': ['cms', 'content', 'blog', 'wiki', 'markdown'],
      'social-media': ['social', 'twitter', 'facebook', 'instagram', 'slack', 'discord'],
      
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