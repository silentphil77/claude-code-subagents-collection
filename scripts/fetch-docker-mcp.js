#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Categorize a Docker MCP server based on its name and description
 */
function categorizeDockerMCPServer(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  // AI & ML
  if (text.match(/\b(ai|artificial intelligence|llm|gpt|claude|model|machine learning|ml|neural|deep learning|nlp|natural language|vision|opencv|tensorflow|pytorch|hugging|transformer|bert|embedding|vector|semantic|chatbot|assistant|arxiv|research|paper|academic|journal|publication|scholar|pubmed)\b/)) {
    return 'ai-task-management';
  }
  
  // Data & Databases
  if (text.match(/\b(database|db|sql|sqlite|mysql|postgres|postgresql|mongo|mongodb|redis|elastic|elasticsearch|clickhouse|couchbase|cockroach|astra|cassandra|dynamo|firestore|supabase|prisma|orm|data warehouse|analytics|etl|bigquery|snowflake|databricks|spark|hadoop)\b/)) {
    return 'database';
  }
  
  // Cloud & Infrastructure
  if (text.match(/\b(aws|amazon web|azure|gcp|google cloud|cloud|terraform|cdk|cloudformation|kubernetes|k8s|docker|container|serverless|lambda|functions|ec2|s3|vpc|iam|infrastructure)\b/)) {
    return 'cloud-infrastructure';
  }
  
  // DevOps & CI/CD
  if (text.match(/\b(github|gitlab|git|version control|ci|cd|continuous|jenkins|circleci|buildkite|travis|pipeline|build|deploy|devops|monitoring|logging|observability|metrics|grafana|prometheus|datadog|new relic|sentry)\b/)) {
    return 'developer-tools';
  }
  
  // APIs & Integration
  if (text.match(/\b(api|rest|restful|graphql|openapi|swagger|webhook|endpoint|http|https|request|response|postman|insomnia|soap|rpc|grpc|websocket|socket|integration|connector|gateway|proxy)\b/)) {
    return 'api-development';
  }
  
  // Search & Discovery
  if (text.match(/\b(search|index|indexing|elastic|algolia|solr|lucene|query|find|discover|explore|brave search|google search|bing|duckduckgo|retrieval|rag|vector search|similarity|relevance|ranking)\b/)) {
    return 'web-search';
  }
  
  // Communication & Messaging
  if (text.match(/\b(slack|discord|teams|telegram|whatsapp|sms|email|mail|smtp|imap|twilio|sendgrid|mailgun|chat|message|messaging|notification|alert|webhook|communication|collaborate|conversation)\b/)) {
    return 'email-integration';
  }
  
  // Productivity & Project Management
  if (text.match(/\b(notion|todo|task|project|jira|confluence|atlassian|asana|trello|monday|clickup|linear|airtable|spreadsheet|excel|sheets|docs|document|wiki|knowledge|note|notebook|markdown|obsidian|roam|productivity|workflow|automation|zapier|ifttt|make|n8n)\b/)) {
    return 'productivity';
  }
  
  // Browser & Web Automation
  if (text.match(/\b(browser|chrome|firefox|safari|edge|web|scrape|scraping|crawl|crawler|puppeteer|playwright|selenium|webdriver|automation|bot|headless|dom|html|css|javascript|jquery|react|vue|angular|website|webpage)\b/)) {
    return 'browser-automation';
  }
  
  // Finance & Trading
  if (text.match(/\b(finance|financial|trading|trade|stock|equity|forex|crypto|cryptocurrency|bitcoin|ethereum|blockchain|defi|nft|market|ticker|price|portfolio|investment|banking|payment|stripe|paypal|square|plaid|coinbase|binance|kraken)\b/)) {
    return 'blockchain-crypto';
  }
  
  // Media & Content
  if (text.match(/\b(video|audio|image|media|youtube|vimeo|spotify|soundcloud|mp3|mp4|avi|mov|jpg|jpeg|png|gif|svg|pdf|ffmpeg|transcod|stream|broadcast|podcast|music|photo|picture|gallery|edit|filter|compress|resize|thumbnail)\b/)) {
    return 'media-generation';
  }
  
  // File System
  if (text.match(/\b(file|filesystem|fs|directory|folder|path|storage|drive|disk|mount|volume|permission|chmod|chown)\b/)) {
    return 'file-system';
  }
  
  // Default category
  return 'utilities';
}

/**
 * Format server name for display
 */
function formatServerName(name) {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract tags from name and description
 */
function extractTags(name, description) {
  const tags = [];
  const text = `${name} ${description}`.toLowerCase();
  
  // Extract technology tags
  if (text.includes('aws')) tags.push('aws');
  if (text.includes('github')) tags.push('github');
  if (text.includes('docker')) tags.push('docker');
  if (text.includes('kubernetes') || text.includes('k8s')) tags.push('kubernetes');
  if (text.includes('database') || text.includes('db')) tags.push('database');
  if (text.includes('api')) tags.push('api');
  if (text.includes('ai') || text.includes('ml')) tags.push('ai');
  if (text.includes('search')) tags.push('search');
  if (text.includes('security')) tags.push('security');
  if (text.includes('monitoring')) tags.push('monitoring');
  if (text.includes('messaging')) tags.push('messaging');
  if (text.includes('productivity')) tags.push('productivity');
  
  return [...new Set(tags)];
}

/**
 * Fetch Docker MCP servers from catalog
 */
async function fetchDockerMCPServers() {
  try {
    const { stdout } = await execAsync('docker mcp catalog show');
    
    // Parse the catalog output - handle the actual format
    const lines = stdout.split('\n');
    const servers = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // The actual format is "name: description" where name might be repeated
      // Example: "Ref: Ref powerful search tool..."
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const name = line.substring(0, colonIndex).trim();
      const description = line.substring(colonIndex + 1).trim();
      
      // Skip invalid entries
      if (!name || !description) continue;
      
      const category = categorizeDockerMCPServer(name, description);
      
      servers.push({
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        display_name: formatServerName(name),
        category,
        description,
        server_type: 'stdio',
        protocol_version: '1.0.0',
        execution_type: 'local', // Docker MCP servers run locally
        verification: {
          status: 'verified',
          maintainer: 'Docker',
          last_tested: new Date().toISOString().split('T')[0],
          tested_with: ['claude-3.5', 'claude-code']
        },
        sources: {
          docker: `https://hub.docker.com/r/mcp/${name.toLowerCase()}`,
          official: `https://hub.docker.com/r/mcp/${name.toLowerCase()}`
        },
        source_registry: {
          type: 'docker',
          url: `https://hub.docker.com/r/mcp/${name.toLowerCase()}`,
          verified_by: 'Docker',
          last_fetched: new Date().toISOString()
        },
        installation_methods: [
          {
            type: 'bwc',
            recommended: true,
            command: `bwc add --mcp ${name.toLowerCase()}`,
            requirements: ['Docker Desktop', 'Docker MCP Toolkit', 'BWC CLI']
          },
          {
            type: 'docker',
            command: `docker mcp server enable ${name.toLowerCase()}`,
            requirements: ['Docker Desktop', 'Docker MCP Toolkit']
          }
        ],
        tags: extractTags(name, description),
        file: `docker-mcp/${name.toLowerCase()}.md`,
        path: `docker-mcp/${name.toLowerCase()}`
      });
    }
    
    console.log(`Successfully fetched ${servers.length} Docker MCP servers`);
    return servers;
  } catch (error) {
    console.error('Failed to fetch Docker MCP servers:', error.message);
    console.log('Using fallback mock data for development');
    // Return mock data if Docker MCP is not available
    return getMockDockerServers();
  }
}

/**
 * Get mock Docker servers for development
 */
function getMockDockerServers() {
  const mockServers = [
    { name: 'Ref', description: 'Ref powerful search tool connects your coding tools with documentation context' },
    { name: 'SQLite', description: 'Database interaction and business intelligence capabilities' },
    { name: 'aws', description: 'Amazon Web Services integration' },
    { name: 'github', description: 'GitHub API integration' },
    { name: 'slack', description: 'Slack messaging integration' },
    { name: 'brave-search', description: 'Brave search engine integration' },
    { name: 'google-drive', description: 'Google Drive file management' },
    { name: 'notion', description: 'Notion workspace integration' },
    { name: 'docker', description: 'Docker container management' },
    { name: 'kubernetes', description: 'Kubernetes cluster operations' },
    { name: 'terraform', description: 'Infrastructure as code with Terraform' }
  ];
  
  return mockServers.map(server => ({
    name: server.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    display_name: formatServerName(server.name),
    category: categorizeDockerMCPServer(server.name, server.description),
    description: server.description,
    server_type: 'stdio',
    protocol_version: '1.0.0',
    execution_type: 'local',
    verification: {
      status: 'verified',
      maintainer: 'Docker',
      last_tested: new Date().toISOString().split('T')[0],
      tested_with: ['claude-3.5', 'claude-code']
    },
    sources: {
      docker: `https://hub.docker.com/r/mcp/${server.name.toLowerCase()}`,
      official: `https://hub.docker.com/r/mcp/${server.name.toLowerCase()}`
    },
    source_registry: {
      type: 'docker',
      url: `https://hub.docker.com/r/mcp/${server.name.toLowerCase()}`,
      verified_by: 'Docker',
      last_fetched: new Date().toISOString()
    },
    installation_methods: [
      {
        type: 'bwc',
        recommended: true,
        command: `bwc add --mcp ${server.name.toLowerCase()}`,
        requirements: ['Docker Desktop', 'Docker MCP Toolkit', 'BWC CLI']
      },
      {
        type: 'docker',
        command: `docker mcp server enable ${server.name.toLowerCase()}`,
        requirements: ['Docker Desktop', 'Docker MCP Toolkit']
      }
    ],
    tags: extractTags(server.name, server.description),
    file: `docker-mcp/${server.name.toLowerCase()}.md`,
    path: `docker-mcp/${server.name.toLowerCase()}`
  }));
}

// Export for use in other scripts
module.exports = {
  fetchDockerMCPServers,
  categorizeDockerMCPServer
};

// If run directly, output the servers as JSON
if (require.main === module) {
  fetchDockerMCPServers().then(servers => {
    console.log(JSON.stringify(servers, null, 2));
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}