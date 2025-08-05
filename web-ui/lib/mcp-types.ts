export interface MCPServer {
  name: string
  display_name: string
  category: string
  description: string
  server_type: 'stdio' | 'http' | 'websocket'
  protocol_version: string
  verification: MCPVerification
  sources: MCPSources
  security?: MCPSecurity
  stats?: MCPStats
  installation_methods: MCPInstallationMethod[]
  tags: string[]
  file: string
  path: string
}

export interface MCPVerification {
  status: 'verified' | 'community' | 'experimental'
  last_tested?: string
  tested_with?: string[]
  maintainer?: string
}

export interface MCPSources {
  official?: string
  github?: string
  docker?: string
  npm?: string
  documentation?: string
}

export interface MCPSecurity {
  auth_type: string
  permissions: string[]
  data_handling?: string
  audit_log?: boolean
}

export interface MCPStats {
  github_stars?: number
  docker_pulls?: number
  npm_downloads?: number
  last_updated?: string
}

export interface MCPInstallationMethod {
  type: 'docker' | 'npm' | 'manual' | 'binary' | 'bwc'
  recommended?: boolean
  command?: string
  config_example?: string
  steps?: string[]
  requirements?: string[]
}

// Verification status display
export const VERIFICATION_STATUS = {
  verified: {
    label: 'Verified',
    icon: '✅',
    className: 'text-green-600 bg-green-100 border-green-200',
    description: 'Officially tested and verified by the community'
  },
  community: {
    label: 'Community',
    icon: '🤝',
    className: 'text-blue-600 bg-blue-100 border-blue-200',
    description: 'Community contributed and maintained'
  },
  experimental: {
    label: 'Experimental',
    icon: '🧪',
    className: 'text-amber-600 bg-amber-100 border-amber-200',
    description: 'Experimental - use with caution'
  }
} as const

// MCP Categories
export const MCP_CATEGORIES = {
  database: {
    name: 'Database',
    icon: '🗄️',
    description: 'Database connectors and query tools'
  },
  development: {
    name: 'Development',
    icon: '🛠️',
    description: 'Development tools and integrations'
  },
  messaging: {
    name: 'Messaging',
    icon: '💬',
    description: 'Messaging and communication platforms'
  },
  automation: {
    name: 'Automation',
    icon: '🤖',
    description: 'Automation and workflow tools'
  },
  analytics: {
    name: 'Analytics',
    icon: '📊',
    description: 'Analytics and monitoring tools'
  },
  ai: {
    name: 'AI/ML',
    icon: '🧠',
    description: 'AI and machine learning services'
  },
  cloud: {
    name: 'Cloud',
    icon: '☁️',
    description: 'Cloud platform integrations'
  },
  security: {
    name: 'Security',
    icon: '🔒',
    description: 'Security and authentication services'
  }
} as const

export type MCPCategoryKey = keyof typeof MCP_CATEGORIES
export type VerificationStatus = keyof typeof VERIFICATION_STATUS

// Helper functions
export function getMCPCategoryDisplayName(category: string): string {
  const cat = MCP_CATEGORIES[category as MCPCategoryKey]
  return cat?.name || category.charAt(0).toUpperCase() + category.slice(1)
}

export function getMCPCategoryIcon(category: string): string {
  const cat = MCP_CATEGORIES[category as MCPCategoryKey]
  return cat?.icon || '📦'
}

export function getVerificationBadge(status: VerificationStatus) {
  return VERIFICATION_STATUS[status] || VERIFICATION_STATUS.experimental
}