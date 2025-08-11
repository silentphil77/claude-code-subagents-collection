import { execClaudeCLI, isClaudeCLIAvailable } from './claude-cli.js'
import { logger } from './logger.js'
import chalk from 'chalk'

/**
 * Options for removing MCP servers
 */
interface MCPRemoveOptions {
  scope?: 'local' | 'user' | 'project'
}

/**
 * Remove an MCP server from Claude Code using Claude CLI
 */
export async function removeFromClaudeCode(
  serverName: string,
  options: MCPRemoveOptions = {}
): Promise<boolean> {
  const hasClaudeCLI = await isClaudeCLIAvailable()
  
  if (!hasClaudeCLI) {
    logger.warn('Claude CLI is not installed. Cannot automatically remove from Claude Code.')
    logger.info('To manually remove the server, run:')
    logger.info(chalk.cyan(`  claude mcp remove ${options.scope ? `--scope ${options.scope} ` : ''}${serverName}`))
    return false
  }
  
  try {
    const args = ['mcp', 'remove']
    
    // Add scope if specified
    if (options.scope) {
      args.push('--scope', options.scope)
    }
    
    // Add server name
    args.push(serverName)
    
    logger.info(`Removing MCP server from Claude Code${options.scope ? ` (${options.scope} scope)` : ''}...`)
    logger.debug(`Running: claude ${args.join(' ')}`)
    
    const result = await execClaudeCLI(args)
    
    if (result.stdout) {
      logger.debug(result.stdout)
    }
    
    logger.success(`MCP server "${serverName}" removed from Claude Code${options.scope ? ` (${options.scope} scope)` : ''}`)
    return true
  } catch (error: any) {
    // Check if the error is because the server doesn't exist
    if (error.stderr && error.stderr.includes('not found')) {
      logger.info(`Server "${serverName}" was not found in Claude Code${options.scope ? ` ${options.scope} scope` : ''}`)
      return false
    }
    
    logger.error(`Failed to remove from Claude Code: ${error.message}`)
    if (error.stderr) {
      logger.debug(error.stderr)
    }
    
    // Provide manual fallback
    logger.info('\nTo manually remove the server, run:')
    logger.info(chalk.cyan(`  claude mcp remove ${options.scope ? `--scope ${options.scope} ` : ''}${serverName}`))
    
    return false
  }
}

/**
 * Check if an MCP server exists in Claude Code
 */
export async function serverExistsInClaudeCode(
  serverName: string,
  scope?: 'local' | 'user' | 'project'
): Promise<boolean> {
  const hasClaudeCLI = await isClaudeCLIAvailable()
  
  if (!hasClaudeCLI) {
    return false
  }
  
  try {
    // Use claude mcp list to check if server exists
    const args = ['mcp', 'list']
    if (scope) {
      args.push('--scope', scope)
    }
    
    const result = await execClaudeCLI(args)
    
    // Check if the server name appears in the output
    return result.stdout.includes(serverName)
  } catch (error) {
    logger.debug(`Error checking server existence: ${error}`)
    return false
  }
}