import { MCPServerConfig } from '../registry/types.js'

/**
 * MCP Configuration Converter Utilities
 * Handles conversion between BWC config format and .mcp.json format
 */

/**
 * Convert BWC config format to .mcp.json format
 * BWC uses 'transport' field, .mcp.json uses 'type' for SSE/HTTP
 */
export function convertToMCPJsonFormat(
  serverName: string,
  config: MCPServerConfig
): any {
  const mcpJsonConfig: any = {
    mcpServers: {
      [serverName]: {}
    }
  }
  
  const serverEntry = mcpJsonConfig.mcpServers[serverName]
  
  if (config.transport === 'stdio') {
    // STDIO servers need command, args, env
    if (config.command) serverEntry.command = config.command
    if (config.args) serverEntry.args = config.args
    if (config.env) serverEntry.env = config.env
  } else if (config.transport === 'sse' || config.transport === 'http') {
    // SSE/HTTP servers need 'type' (not 'transport') and url
    serverEntry.type = config.transport  // Convert 'transport' to 'type'
    if (config.url) serverEntry.url = config.url
    if (config.headers) serverEntry.headers = config.headers
    if (config.env) serverEntry.env = config.env
  }
  
  return mcpJsonConfig
}

/**
 * Check if a server configuration should be added to .mcp.json
 * Docker servers should NOT be added (they use Docker gateway)
 */
export function shouldAddToMCPJson(config: MCPServerConfig): boolean {
  // Only add non-Docker servers with project scope
  return config.scope === 'project' && config.provider !== 'docker'
}

/**
 * Convert .mcp.json format back to BWC config format
 * Used when reading from .mcp.json
 */
export function convertFromMCPJsonFormat(
  serverName: string,
  mcpJsonEntry: any
): MCPServerConfig {
  const config: MCPServerConfig = {
    provider: 'claude',
    transport: 'stdio',
    scope: 'project',
    installedAt: new Date().toISOString()
  }
  
  // Detect transport type based on fields
  if (mcpJsonEntry.type === 'sse' || mcpJsonEntry.type === 'http') {
    // SSE/HTTP server
    config.transport = mcpJsonEntry.type
    if (mcpJsonEntry.url) config.url = mcpJsonEntry.url
    if (mcpJsonEntry.headers) config.headers = mcpJsonEntry.headers
    if (mcpJsonEntry.env) config.env = mcpJsonEntry.env
  } else if (mcpJsonEntry.command) {
    // STDIO server
    config.transport = 'stdio'
    config.command = mcpJsonEntry.command
    if (mcpJsonEntry.args) config.args = mcpJsonEntry.args
    if (mcpJsonEntry.env) config.env = mcpJsonEntry.env
  }
  
  return config
}