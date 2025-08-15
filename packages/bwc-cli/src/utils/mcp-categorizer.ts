/**
 * MCP Server Categorizer
 * Automatically categorizes Docker MCP servers based on name and description
 * Categories align with Docker Hub MCP categories
 */

export interface DockerMCPCategory {
  id: string
  name: string
  icon: string
  description: string
}

/**
 * Docker Hub MCP Categories
 * Based on https://hub.docker.com/mcp/explore categories
 */
export const DOCKER_MCP_CATEGORIES: Record<string, DockerMCPCategory> = {
  ai: {
    id: 'ai',
    name: 'AI & ML',
    icon: '🤖',
    description: 'AI models, LLMs, and machine learning services'
  },
  data: {
    id: 'data',
    name: 'Data & Databases',
    icon: '🗄️',
    description: 'Databases, data processing, and analytics'
  },
  devops: {
    id: 'devops',
    name: 'DevOps',
    icon: '🔧',
    description: 'CI/CD, build tools, and monitoring'
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity',
    icon: '📝',
    description: 'Task management, note-taking, and documentation'
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'Chat, email, and messaging platforms'
  },
  search: {
    id: 'search',
    name: 'Search',
    icon: '🔍',
    description: 'Search engines, indexing, and discovery'
  },
  security: {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    description: 'Security scanning, authentication, and compliance'
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud',
    icon: '☁️',
    description: 'Cloud providers and infrastructure'
  },
  api: {
    id: 'api',
    name: 'APIs',
    icon: '🔌',
    description: 'API management, REST, and GraphQL'
  },
  browser: {
    id: 'browser',
    name: 'Browser & Web',
    icon: '🌐',
    description: 'Web automation and scraping'
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    description: 'Financial data, trading, and crypto'
  },
  media: {
    id: 'media',
    name: 'Media',
    icon: '🎬',
    description: 'Audio, video, and image processing'
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: '📦',
    description: 'Miscellaneous tools and services'
  }
}

/**
 * Categorize a Docker MCP server based on its name and description
 */
export function categorizeDockerMCPServer(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase()
  
  // AI & ML
  if (text.match(/\b(ai|artificial intelligence|llm|gpt|claude|model|machine learning|ml|neural|deep learning|nlp|natural language|vision|opencv|tensorflow|pytorch|hugging|transformer|bert|embedding|vector|semantic|chatbot|assistant)\b/)) {
    return 'ai'
  }
  
  // Data & Databases
  if (text.match(/\b(database|db|sql|sqlite|mysql|postgres|postgresql|mongo|mongodb|redis|elastic|elasticsearch|clickhouse|couchbase|cockroach|astra|cassandra|dynamo|firestore|supabase|prisma|orm|data warehouse|analytics|etl|bigquery|snowflake|databricks|spark|hadoop)\b/)) {
    return 'data'
  }
  
  // Cloud & Infrastructure
  if (text.match(/\b(aws|amazon web|azure|gcp|google cloud|cloud|terraform|cdk|cloudformation|kubernetes|k8s|docker|container|serverless|lambda|functions|ec2|s3|vpc|iam|infrastructure|iaas|paas|saas|deployment|provision)\b/)) {
    return 'cloud'
  }
  
  // DevOps & CI/CD
  if (text.match(/\b(github|gitlab|git|version control|ci|cd|continuous|jenkins|circleci|buildkite|travis|pipeline|build|deploy|devops|monitoring|logging|observability|metrics|grafana|prometheus|datadog|new relic|sentry|rollbar|automation)\b/)) {
    return 'devops'
  }
  
  // Security
  if (text.match(/\b(security|auth|authentication|authorization|oauth|jwt|token|certificate|ssl|tls|encryption|decrypt|hash|vulnerability|scan|audit|compliance|firewall|vpn|penetration|pentest|beagle|shodan|nmap|metasploit|burp|owasp|cve|threat|malware|virus|antivirus|password|credential|secret|vault|keychain)\b/)) {
    return 'security'
  }
  
  // APIs & Integration
  if (text.match(/\b(api|rest|restful|graphql|openapi|swagger|webhook|endpoint|http|https|request|response|postman|insomnia|soap|rpc|grpc|websocket|socket|integration|connector|gateway|proxy|rate limit|throttle)\b/)) {
    return 'api'
  }
  
  // Search & Discovery
  if (text.match(/\b(search|index|indexing|elastic|algolia|solr|lucene|query|find|discover|explore|brave search|google search|bing|duckduckgo|retrieval|rag|vector search|similarity|relevance|ranking)\b/)) {
    return 'search'
  }
  
  // Communication & Messaging
  if (text.match(/\b(slack|discord|teams|telegram|whatsapp|sms|email|mail|smtp|imap|twilio|sendgrid|mailgun|chat|message|messaging|notification|alert|webhook|communication|collaborate|conversation)\b/)) {
    return 'communication'
  }
  
  // Productivity & Project Management
  if (text.match(/\b(notion|todo|task|project|jira|confluence|atlassian|asana|trello|monday|clickup|linear|airtable|spreadsheet|excel|sheets|docs|document|wiki|knowledge|note|notebook|markdown|obsidian|roam|productivity|workflow|automation|zapier|ifttt|make|n8n)\b/)) {
    return 'productivity'
  }
  
  // Browser & Web Automation
  if (text.match(/\b(browser|chrome|firefox|safari|edge|web|scrape|scraping|crawl|crawler|puppeteer|playwright|selenium|webdriver|automation|bot|headless|dom|html|css|javascript|jquery|react|vue|angular|website|webpage)\b/)) {
    return 'browser'
  }
  
  // Finance & Trading
  if (text.match(/\b(finance|financial|trading|trade|stock|equity|forex|crypto|cryptocurrency|bitcoin|ethereum|blockchain|defi|nft|market|ticker|price|portfolio|investment|banking|payment|stripe|paypal|square|plaid|coinbase|binance|kraken)\b/)) {
    return 'finance'
  }
  
  // Media & Content
  if (text.match(/\b(video|audio|image|media|youtube|vimeo|spotify|soundcloud|mp3|mp4|avi|mov|jpg|jpeg|png|gif|svg|pdf|ffmpeg|transcod|stream|broadcast|podcast|music|photo|picture|gallery|edit|filter|compress|resize|thumbnail)\b/)) {
    return 'media'
  }
  
  // Research & Academic
  if (text.match(/\b(arxiv|research|paper|academic|journal|publication|scholar|pubmed|doi|citation|bibliography|latex|scientific|study|experiment|hypothesis|peer review)\b/)) {
    return 'ai' // Research tools often relate to AI/ML
  }
  
  // Documentation & Knowledge
  if (text.match(/\b(documentation|docs|manual|guide|tutorial|reference|wiki|knowledge base|help|support|faq|readme|context|atlas-docs)\b/)) {
    return 'productivity'
  }
  
  // Default category
  return 'other'
}

/**
 * Get category display information
 */
export function getCategoryInfo(categoryId: string): DockerMCPCategory {
  return DOCKER_MCP_CATEGORIES[categoryId] || DOCKER_MCP_CATEGORIES.other
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds(): string[] {
  return Object.keys(DOCKER_MCP_CATEGORIES)
}

/**
 * Sort servers by category for display
 */
export function sortServersByCategory(servers: Array<{ name: string; description: string; category?: string }>): Record<string, typeof servers> {
  const categorized: Record<string, typeof servers> = {}
  
  for (const server of servers) {
    const category = server.category || categorizeDockerMCPServer(server.name, server.description)
    if (!categorized[category]) {
      categorized[category] = []
    }
    categorized[category].push({ ...server, category })
  }
  
  return categorized
}