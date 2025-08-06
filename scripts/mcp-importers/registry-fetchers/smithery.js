/**
 * Smithery.ai Registry Fetcher
 * Fetches from https://smithery.ai API
 */

export class SmitheryFetcher {
  constructor(apiKey) {
    this.apiUrl = 'https://registry.smithery.ai/servers'
    this.apiKey = apiKey
  }
  
  async fetchServers() {
    if (!this.apiKey) {
      console.warn('No Smithery API key provided. Set SMITHERY_API_KEY in .env file.')
      return []
    }
    
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'MCP-Importer',
      'Authorization': `Bearer ${this.apiKey}`
    }
    
    const response = await fetch(`${this.apiUrl}?pageSize=100`, { headers })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Smithery API key. Please check your SMITHERY_API_KEY.')
      }
      throw new Error(`Smithery API error: ${response.status}`)
    }
    
    const data = await response.json()
    const servers = []
    
    // Smithery API returns servers in 'servers' field
    for (const item of data.servers || []) {
      const server = this.convertSmitheryServer(item)
      if (server) {
        servers.push(server)
      }
    }
    
    return servers
  }
  
  convertSmitheryServer(data) {
    // Determine if it's a hosted server based on 'remote' field (boolean)
    const isHosted = data.remote === true
    
    // Clean the qualified name for use as filename
    // Remove leading @ symbols, then replace remaining @ and / with -
    const safeName = data.qualifiedName
      .replace(/^@+/, '')  // Remove leading @ symbols
      .replace(/[@\/]/g, '-')  // Replace remaining @ and / with -
    
    // Clean and escape description for YAML - must be properly quoted if it contains special chars
    let cleanDescription = (data.description || '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // If description contains special YAML characters, quote it
    if (cleanDescription && /[:\*\|\>\{\}\[\]&!%@`]/.test(cleanDescription)) {
      cleanDescription = `"${cleanDescription.replace(/"/g, '\\"')}"`;
    }
    
    // Calculate popularity score
    const popularityScore = this.calculatePopularityScore(data);
    
    // Build badges array
    const badges = [];
    
    // Add popularity badges based on use count
    if (data.useCount > 100000) {
      badges.push('popular');
    } else if (data.useCount > 50000) {
      badges.push('featured');
    } else if (data.useCount > 10000) {
      badges.push('trending');
    }
    
    // Add source badges
    if (isHosted) {
      badges.push('smithery-hosted', 'remote-execution');
    } else {
      badges.push('smithery', 'local-execution');
    }
    
    // For Smithery hosted servers, we can use SSE transport
    // Format: claude mcp add --transport sse <name> <url>
    const sseUrl = `https://mcp.smithery.ai/sse/${data.qualifiedName}`;
    
    const installationMethods = [];
    
    if (isHosted) {
      // Remote servers use SSE transport
      installationMethods.push({
        type: 'claude-cli',
        recommended: true,
        command: `claude mcp add --transport sse ${safeName} ${sseUrl}`,
        config_example: JSON.stringify({
          mcpServers: {
            [safeName]: {
              transport: 'sse',
              url: sseUrl
            }
          }
        }, null, 2)
      });
    }
    
    // Always add BWC method for backward compatibility
    installationMethods.push({
      type: 'bwc',
      command: `bwc add --mcp ${data.qualifiedName}`
    });
    
    // Add manual method as fallback
    installationMethods.push({
      type: 'manual',
      steps: [`Visit ${data.homepage || 'https://smithery.ai'} for installation instructions`]
    });
    
    return {
      name: data.qualifiedName.startsWith('@') ? `"${data.qualifiedName}"` : data.qualifiedName,
      display_name: data.displayName || data.qualifiedName,
      category: this.detectCategory(data.qualifiedName, cleanDescription),
      description: cleanDescription,
      server_type: isHosted ? 'sse' : 'stdio',
      protocol_version: '1.0.0',
      execution_type: isHosted ? 'remote' : 'local',
      popularity_score: popularityScore,
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
        status: 'community',
        last_tested: new Date().toISOString().split('T')[0],
        tested_with: ['claude-3.5']
      },
      stats: {
        use_count: data.useCount,
        last_updated: data.createdAt
      },
      installation_methods: installationMethods,
      tags: [],
      badges: badges,
      file: `auto-imported/smithery/${safeName}.md`,
      source_registry: {
        type: 'smithery',
        id: data.qualifiedName,
        url: data.homepage,
        last_fetched: new Date().toISOString(),
        auto_update: true,
        verified_by: 'smithery'
      }
    }
  }
  
  calculatePopularityScore(data) {
    let score = data.useCount || 0;
    
    // Boost for recent updates
    if (data.createdAt) {
      const daysSinceUpdate = (Date.now() - new Date(data.createdAt)) / (1000 * 60 * 60 * 24);
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
    const lowerDesc = (description || '').toLowerCase().replace(/['"]/g, ''); // Remove quotes from description
    const combined = `${lowerName} ${lowerDesc}`;
    
    // Special cases - check name first for specific patterns
    if (name.includes('@modelcontextprotocol/')) return 'official';
    
    const categoryRules = {
      'web-search': ['search', 'google', 'bing', 'duckduckgo', 'exa', 'perplexity', 'brave search'],
      'browser-automation': ['browser', 'playwright', 'puppeteer', 'selenium', 'browserbase', 'stagehand', 'chrome', 'firefox'],
      'memory-management': ['memory', 'context', 'remember', 'recall', 'persist', 'memory bank'],
      'email-integration': ['email', 'gmail', 'outlook', 'mail', 'smtp', 'imap'],
      'blockchain-crypto': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'defi', 'nft', 'ccxt', 'trading', 'exchange', 'forex'],
      'ai-task-management': ['think', 'reasoning', 'agent', 'multi-agent', 'debate', 'sequential', 'clear thought', 'chain of thought'],
      
      'developer-tools': ['terminal', 'command', 'shell', 'code', 'ide', 'debug', 'laravel', 'developer', 'desktop commander'],
      'api-development': ['api', 'rest', 'graphql', 'postman', 'swagger', 'webhook'],
      'version-control': ['git', 'github', 'gitlab', 'commit', 'merge', 'pull request'],
      
      'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'supabase', 'sqlite', 'prisma'],
      'file-system': ['file', 'filesystem', 'directory', 'folder', 'document', 'word', 'excel', 'pdf'],
      'cloud-infrastructure': ['aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker', 'railway'],
      
      'productivity': ['task', 'todo', 'notion', 'fibery', 'todoist', 'calendar', 'time', 'productivity'],
      'content-management': ['cms', 'content', 'blog', 'wiki', 'markdown'],
      'social-media': ['social', 'twitter', 'facebook', 'instagram', 'reddit', 'slack', 'discord'],
      
      'research-education': ['research', 'pubmed', 'wikipedia', 'library', 'academic', 'scientific', 'education', 'edubase', 'quiz', 'learn', 'paper'],
      'media-generation': ['image', 'video', 'generate', 'art', 'paint', 'flux', 'design', 'figma', 'jimeng'],
      'data-extraction': ['scrape', 'scraping', 'extract', 'parse', 'fetch', 'crawler', 'decodo'],
      'finance-trading': ['finance', 'financial', 'stock', 'market', 'investment', 'modeling prep'],
      
      'analytics': ['analytics', 'metrics', 'monitoring', 'tracking', 'sentry', 'statistics']
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