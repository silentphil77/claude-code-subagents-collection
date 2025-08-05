import { z } from 'zod';

// MCP Server Security Schema
export const MCPSecuritySchema = z.object({
  auth_type: z.enum(['none', 'oauth2', 'oauth2.1', 'api-key']),
  permissions: z.array(z.string()),
  resource_indicators: z.boolean().optional(),
  elicitation_schema: z.any().nullable().optional(),
});

// MCP Server Verification Schema
export const MCPVerificationSchema = z.object({
  status: z.enum(['verified', 'community', 'experimental']),
  last_tested: z.string(),
  tested_with: z.array(z.string()),
  security_audit: z.boolean().optional(),
});

// MCP Server Sources Schema
export const MCPSourcesSchema = z.object({
  official: z.string().optional(),
  docker: z.string().optional(),
  npm: z.string().optional(),
  marketplace: z.object({
    smithery: z.string().url().optional(),
    mcpmarket: z.string().url().optional(),
  }).optional(),
});

// MCP Server Stats Schema
export const MCPStatsSchema = z.object({
  github_stars: z.number().optional(),
  docker_pulls: z.number().optional(),
  npm_downloads: z.number().optional(),
  last_updated: z.string().optional(),
});

// MCP Installation Method Schema
export const MCPInstallationMethodSchema = z.object({
  type: z.enum(['docker', 'npm', 'manual', 'binary', 'bwc']),
  recommended: z.boolean().optional(),
  command: z.string().optional(),
  config_example: z.string().optional(),
  steps: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
});

// Main MCP Server Schema
export const MCPServerSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  category: z.enum([
    'databases',
    'file-systems',
    'apis',
    'monitoring',
    'development',
    'ai-tools',
    'productivity',
    'web'
  ]),
  description: z.string(),
  server_type: z.enum(['stdio', 'streaming-http', 'websocket']),
  protocol_version: z.string(),
  security: MCPSecuritySchema,
  sources: MCPSourcesSchema,
  verification: MCPVerificationSchema,
  stats: MCPStatsSchema.optional(),
  installation_methods: z.array(MCPInstallationMethodSchema),
  config_schema: z.any().optional(),
  tags: z.array(z.string()).default([]),
  file: z.string(),
  path: z.string(),
});

// Type exports
export type MCPSecurity = z.infer<typeof MCPSecuritySchema>;
export type MCPVerification = z.infer<typeof MCPVerificationSchema>;
export type MCPSources = z.infer<typeof MCPSourcesSchema>;
export type MCPStats = z.infer<typeof MCPStatsSchema>;
export type MCPInstallationMethod = z.infer<typeof MCPInstallationMethodSchema>;
export type MCPServer = z.infer<typeof MCPServerSchema>;

// MCP Registry Schema
export const MCPRegistrySchema = z.object({
  $schema: z.string(),
  version: z.string(),
  lastUpdated: z.string(),
  subagents: z.array(z.any()), // Using existing subagent schema
  commands: z.array(z.any()),  // Using existing command schema
  mcpServers: z.array(MCPServerSchema),
});

export type MCPRegistry = z.infer<typeof MCPRegistrySchema>;

// Helper type for MCP server installation
export interface MCPInstallConfig {
  server: MCPServer;
  method: MCPInstallationMethod;
  targetPath?: string;
  env?: Record<string, string>;
}

// Helper type for MCP server search
export interface MCPSearchOptions {
  query?: string;
  category?: MCPServer['category'];
  verificationStatus?: MCPVerification['status'];
  serverType?: MCPServer['server_type'];
  tags?: string[];
}

// Helper type for MCP server stats
export interface MCPServerWithStats extends MCPServer {
  stats: MCPStats;
  popularity: number; // Calculated from stats
}

// Source preference order
export const SOURCE_PREFERENCE = ['docker', 'npm', 'official'] as const;
export type SourceType = typeof SOURCE_PREFERENCE[number];

// Category metadata
export const MCP_CATEGORIES = {
  databases: {
    name: 'Databases',
    icon: '🗄️',
    description: 'Database connectors and data management',
  },
  'file-systems': {
    name: 'File Systems',
    icon: '📁',
    description: 'File and storage system access',
  },
  apis: {
    name: 'APIs',
    icon: '🔌',
    description: 'External API integrations',
  },
  monitoring: {
    name: 'Monitoring',
    icon: '📊',
    description: 'System monitoring and observability',
  },
  development: {
    name: 'Development',
    icon: '🛠️',
    description: 'Development tools and utilities',
  },
  'ai-tools': {
    name: 'AI Tools',
    icon: '🤖',
    description: 'AI and machine learning integrations',
  },
  productivity: {
    name: 'Productivity',
    icon: '📈',
    description: 'Productivity and workflow tools',
  },
  web: {
    name: 'Web',
    icon: '🌐',
    description: 'Web browsing and automation',
  },
} as const;

// Verification status metadata
export const VERIFICATION_STATUS = {
  verified: {
    label: 'Verified',
    icon: '✅',
    color: 'green',
    description: 'Officially tested and security reviewed',
  },
  community: {
    label: 'Community',
    icon: '👥',
    color: 'blue',
    description: 'Popular and community validated',
  },
  experimental: {
    label: 'Experimental',
    icon: '⚠️',
    color: 'yellow',
    description: 'New or untested - use with caution',
  },
} as const;