export interface Subagent {
  slug: string
  name: string
  description: string
  tools?: string
  content: string
  category: string
}

export const CATEGORIES = {
  'development-architecture': 'Development & Architecture',
  'language-specialists': 'Language Specialists',
  'infrastructure-operations': 'Infrastructure & Operations',
  'quality-security': 'Quality & Security',
  'data-ai': 'Data & AI',
  'specialized-domains': 'Specialized Domains',
  'crypto-trading': 'Crypto Trading'
} as const

export type CategoryKey = keyof typeof CATEGORIES

export const categoryMapping: Record<string, CategoryKey> = {
  // Development & Architecture
  'backend-architect': 'development-architecture',
  'frontend-developer': 'development-architecture',
  'mobile-developer': 'development-architecture',
  'graphql-architect': 'development-architecture',
  'directus-developer': 'development-architecture',
  'drupal-developer': 'development-architecture',
  'laravel-vue-developer': 'development-architecture',
  'nextjs-app-router-developer': 'development-architecture',
  'php-developer': 'development-architecture',
  
  // Language Specialists
  'python-pro': 'language-specialists',
  'golang-pro': 'language-specialists',
  'rust-pro': 'language-specialists',
  'typescript-expert': 'language-specialists',
  'ruby-pro': 'language-specialists',
  'rails-pro': 'language-specialists',
  
  // Infrastructure & Operations
  'devops-troubleshooter': 'infrastructure-operations',
  'deployment-engineer': 'infrastructure-operations',
  'cloud-architect': 'infrastructure-operations',
  'database-optimizer': 'infrastructure-operations',
  
  // Quality & Security
  'code-reviewer': 'quality-security',
  'security-auditor': 'quality-security',
  'test-automator': 'quality-security',
  'performance-engineer': 'quality-security',
  'debugger': 'quality-security',
  
  // Data & AI
  'data-scientist': 'data-ai',
  'data-engineer': 'data-ai',
  'ai-engineer': 'data-ai',
  'ml-engineer': 'data-ai',
  
  // Specialized Domains
  'api-documenter': 'specialized-domains',
  'payment-integration': 'specialized-domains',
  'quant-analyst': 'specialized-domains',
  'legacy-modernizer': 'specialized-domains',
  'accessibility-specialist': 'specialized-domains',
  'blockchain-developer': 'specialized-domains',
  'game-developer': 'specialized-domains',
  'ui-ux-designer': 'specialized-domains',
  
  // Crypto Trading
  'crypto-trader': 'crypto-trading',
  'defi-strategist': 'crypto-trading',
  'crypto-analyst': 'crypto-trading',
  'arbitrage-bot': 'crypto-trading',
  'crypto-risk-manager': 'crypto-trading',
}