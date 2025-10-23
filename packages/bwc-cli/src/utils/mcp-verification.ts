import { execa } from 'execa'
import { logger } from './logger.js'
import { execClaudeCLI } from './claude-cli.js'
import { getDockerCommand } from './platform.js'

/**
 * MCP Server Verification Utilities
 * Verifies actual installation of MCP servers in Claude CLI and Docker MCP
 */

export interface MCPVerificationResult {
  name: string
  provider: string
  transport: string
  scope: string
  configuredInBWC: boolean
  actuallyInstalled: boolean
  gatewayConfigured?: boolean
  connectionStatus?: 'connected' | 'error' | 'timeout' | 'unknown'
  verificationError?: string
  fixCommands?: string[]
}

export interface MCPServerConfig {
  provider: string
  transport: string
  scope: string
  url?: string
  registryName?: string
  installedAt?: string
}

/**
 * Verify all MCP servers
 */
export async function verifyMCPServers(
  mcpConfigs: Record<string, MCPServerConfig>
): Promise<MCPVerificationResult[]> {
  const results: MCPVerificationResult[] = []
  
  // Get actually installed servers from both providers
  const claudeServers = await getClaudeMCPServers()
  const dockerServers = await getDockerMCPServers()
  const dockerGatewayConfigured = await isDockerGatewayConfigured()
  
  for (const [name, config] of Object.entries(mcpConfigs)) {
    const result: MCPVerificationResult = {
      name,
      provider: config.provider || 'unknown',
      transport: config.transport || 'unknown',
      scope: config.scope || 'unknown',
      configuredInBWC: true,
      actuallyInstalled: false,
      gatewayConfigured: undefined,
      connectionStatus: 'unknown'
    }
    
    if (config.provider === 'claude') {
      // Check if server is in Claude CLI
      const claudeServer = claudeServers.find(s => s.name === name)
      if (claudeServer) {
        result.actuallyInstalled = true
        result.connectionStatus = claudeServer.status
      } else {
        result.verificationError = 'Not found in Claude CLI configuration'
        result.fixCommands = generateClaudeCLIFixCommands(name, config)
      }
    } else if (config.provider === 'docker') {
      // Check Docker MCP
      result.gatewayConfigured = dockerGatewayConfigured
      
      if (!dockerGatewayConfigured) {
        result.verificationError = 'Docker MCP gateway not configured in Claude CLI'
        result.fixCommands = [
          '1. Setup Docker MCP gateway: bwc add --setup',
          '2. Restart Claude Code to activate gateway',
          `3. Install server: docker mcp server add ${config.registryName || name}`
        ]
      } else {
        const dockerServer = dockerServers.find(s => 
          s === name || s === config.registryName
        )
        if (dockerServer) {
          result.actuallyInstalled = true
          result.connectionStatus = 'connected' // Docker servers are local
        } else {
          result.verificationError = 'Server not installed in Docker MCP'
          result.fixCommands = [`docker mcp server add ${config.registryName || name}`]
        }
      }
    } else {
      result.verificationError = `Unknown provider: ${config.provider}`
    }
    
    results.push(result)
  }
  
  return results
}

/**
 * Get list of MCP servers configured in Claude CLI
 */
async function getClaudeMCPServers(): Promise<Array<{ name: string; status: 'connected' | 'error' }>> {
  try {
    const { stdout } = await execClaudeCLI(['mcp', 'list'])
    const servers: Array<{ name: string; status: 'connected' | 'error' }> = []
    
    // Parse output like:
    // linear-server: https://mcp.linear.app/sse (SSE) - ✓ Connected
    // docker-toolkit: docker mcp gateway run - ✓ Connected
    const lines = stdout.split('\n')
    for (const line of lines) {
      // Match server name and status
      const match = line.match(/^([^:]+):\s+.*\s+-\s+(✓ Connected|✗ Error|.*)$/)
      if (match) {
        const name = match[1].trim()
        const statusText = match[2]
        const status = statusText.includes('Connected') ? 'connected' : 'error'
        
        // Skip the docker-toolkit gateway itself
        if (name !== 'docker-toolkit') {
          servers.push({ name, status })
        }
      }
    }
    
    return servers
  } catch (error) {
    // Claude CLI might not be available or mcp list might fail
    return []
  }
}

/**
 * Check if Docker MCP gateway is configured in Claude CLI
 */
async function isDockerGatewayConfigured(): Promise<boolean> {
  try {
    const { stdout } = await execClaudeCLI(['mcp', 'list'])
    // Look for docker-toolkit in the output
    return stdout.includes('docker-toolkit') || stdout.includes('docker mcp gateway')
  } catch {
    return false
  }
}

/**
 * Get list of MCP servers installed in Docker MCP
 */
async function getDockerMCPServers(): Promise<string[]> {
  try {
    const { stdout } = await execa(getDockerCommand(), ['mcp', 'server', 'list'])
    // Output is comma-separated: "fetch, github-official, playwright"
    const servers = stdout.split(',').map(s => s.trim()).filter(s => s)
    return servers
  } catch {
    // Docker MCP might not be available
    return []
  }
}

/**
 * Generate fix commands for Claude CLI servers
 */
function generateClaudeCLIFixCommands(name: string, config: MCPServerConfig): string[] {
  const commands: string[] = []
  
  if (config.transport === 'sse' && config.url) {
    commands.push(`claude mcp add ${name} --transport sse --url ${config.url}`)
  } else if (config.transport === 'http' && config.url) {
    commands.push(`claude mcp add ${name} --transport http --url ${config.url}`)
  } else {
    // Generic command without specific parameters
    commands.push(`claude mcp add ${name}`)
  }
  
  return commands
}

/**
 * Check if Docker is installed
 */
export async function isDockerInstalled(): Promise<boolean> {
  try {
    const { stdout } = await execa(getDockerCommand(), ['--version'])
    return stdout.includes('Docker version')
  } catch {
    return false
  }
}

/**
 * Check if Docker MCP toolkit is available
 */
export async function isDockerMCPAvailable(): Promise<boolean> {
  try {
    await execa(getDockerCommand(), ['mcp', '--version'])
    return true
  } catch {
    return false
  }
}

/**
 * Format verification results for display
 */
export function formatVerificationIssues(results: MCPVerificationResult[]): string[] {
  const issues: string[] = []
  
  for (const result of results) {
    if (!result.actuallyInstalled && result.verificationError) {
      issues.push(`\n  ${result.name}:`)
      issues.push(`    Issue: ${result.verificationError}`)
      if (result.fixCommands && result.fixCommands.length > 0) {
        if (result.fixCommands.length === 1) {
          issues.push(`    Fix:   ${result.fixCommands[0]}`)
        } else {
          issues.push(`    Fix:   ${result.fixCommands.join('\n           ')}`)
        }
      }
    }
  }
  
  return issues
}