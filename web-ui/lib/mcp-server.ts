import fs from 'fs'
import path from 'path'
import { MCPServer } from './mcp-types'

let registryCache: any = null

function getRegistry() {
  if (!registryCache) {
    const registryPath = path.join(process.cwd(), 'public', 'registry.json')
    const registryContent = fs.readFileSync(registryPath, 'utf8')
    registryCache = JSON.parse(registryContent)
  }
  return registryCache
}

export function getAllMCPServers(): MCPServer[] {
  const registry = getRegistry()
  return registry.mcpServers || []
}

export function getMCPServerBySlug(slug: string): MCPServer | null {
  const servers = getAllMCPServers()
  return servers.find(server => server.path.replace(/\//g, '-') === slug) || null
}

export function getMCPServersByCategory(category: string): MCPServer[] {
  return getAllMCPServers().filter(server => server.category === category)
}

export function getMCPServersByVerification(status: 'verified' | 'community' | 'experimental'): MCPServer[] {
  return getAllMCPServers().filter(server => server.verification.status === status)
}

export function searchMCPServers(query: string): MCPServer[] {
  const normalizedQuery = query.toLowerCase()
  return getAllMCPServers().filter(server => 
    server.name.toLowerCase().includes(normalizedQuery) ||
    server.display_name.toLowerCase().includes(normalizedQuery) ||
    server.description.toLowerCase().includes(normalizedQuery) ||
    server.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  )
}

export interface MCPCategoryMetadata {
  id: string
  displayName: string
  icon: string
  count: number
  description?: string
}

export function getAllMCPCategories(): MCPCategoryMetadata[] {
  const servers = getAllMCPServers()
  const categoryCounts: Record<string, number> = {}
  
  // Count servers per category
  servers.forEach(server => {
    const category = server.category
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })
  
  // Import category definitions
  const { MCP_CATEGORIES } = require('./mcp-types')
  
  // Generate metadata
  const categories: MCPCategoryMetadata[] = []
  
  Object.entries(categoryCounts).forEach(([categoryId, count]) => {
    const categoryDef = MCP_CATEGORIES[categoryId as keyof typeof MCP_CATEGORIES]
    
    categories.push({
      id: categoryId,
      displayName: categoryDef?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      icon: categoryDef?.icon || '📦',
      count,
      description: categoryDef?.description
    })
  })
  
  return categories.sort((a, b) => b.count - a.count)
}

export function getAllMCPCategoryIds(): string[] {
  const servers = getAllMCPServers()
  const categories = new Set(servers.map(s => s.category))
  return Array.from(categories).sort()
}

export interface MCPServerStats {
  total: number
  verified: number
  community: number
  experimental: number
  byCategory: Record<string, number>
}

export function getMCPServerStats(): MCPServerStats {
  const servers = getAllMCPServers()
  const stats: MCPServerStats = {
    total: servers.length,
    verified: 0,
    community: 0,
    experimental: 0,
    byCategory: {}
  }
  
  servers.forEach(server => {
    // Count by verification status
    stats[server.verification.status]++
    
    // Count by category
    stats.byCategory[server.category] = (stats.byCategory[server.category] || 0) + 1
  })
  
  return stats
}

// Get featured servers (verified servers with high stats)
export function getFeaturedMCPServers(limit: number = 6): MCPServer[] {
  return getAllMCPServers()
    .filter(server => server.verification.status === 'verified')
    .sort((a, b) => {
      const aScore = (a.stats?.github_stars || 0) + (a.stats?.docker_pulls || 0) + (a.stats?.npm_downloads || 0)
      const bScore = (b.stats?.github_stars || 0) + (b.stats?.docker_pulls || 0) + (b.stats?.npm_downloads || 0)
      return bScore - aScore
    })
    .slice(0, limit)
}