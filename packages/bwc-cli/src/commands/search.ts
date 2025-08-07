import { Command } from 'commander'
import chalk from 'chalk'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { checkDockerMCPStatus, searchDockerMCPServers, listInstalledDockerMCPServers } from '../utils/docker-mcp.js'

export function createSearchCommand() {
  const search = new Command('search')
    .description('Search for subagents, commands, and MCP servers')
    .argument('<query>', 'search query')
    .option('-a, --agents', 'search subagents only')
    .option('-c, --commands', 'search commands only')
    .option('-m, --mcps', 'search MCP servers only')
    .action(async (query, options) => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)

        if (options.agents) {
          await searchSubagents(query, configManager, registryClient)
        } else if (options.commands) {
          await searchCommands(query, configManager, registryClient)
        } else if (options.mcps) {
          await searchMCPServers(query, configManager, registryClient)
        } else {
          await searchSubagents(query, configManager, registryClient)
          console.log()
          await searchCommands(query, configManager, registryClient)
          console.log()
          await searchMCPServers(query, configManager, registryClient)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return search
}

async function searchSubagents(
  query: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Searching subagents for "${query}"...`)
  
  try {
    const subagents = await registryClient.searchSubagents(query)
    const installed = await configManager.getInstalledSubagents()
    
    spinner.stop()
    
    if (subagents.length === 0) {
      logger.info(`No subagents found matching "${query}"`)
      return
    }
    
    logger.heading(`Subagents matching "${query}" (${subagents.length} results)`)
    
    for (const subagent of subagents) {
      const installedMark = installed.includes(subagent.name) ? chalk.green(' ✓') : ''
      console.log(`\n${chalk.bold(subagent.name)}${installedMark}`)
      console.log(`  ${subagent.description}`)
      console.log(`  ${chalk.gray(`Category: ${subagent.category}`)}`)
      console.log(`  ${chalk.gray(`Tools: ${subagent.tools.join(', ')}`)}`)
      if (subagent.tags.length > 0) {
        console.log(`  ${chalk.gray(`Tags: ${subagent.tags.join(', ')}`)}`)
      }
    }
  } catch (error) {
    spinner.fail('Search failed')
    throw error
  }
}

async function searchCommands(
  query: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Searching commands for "${query}"...`)
  
  try {
    const commands = await registryClient.searchCommands(query)
    const installed = await configManager.getInstalledCommands()
    
    spinner.stop()
    
    if (commands.length === 0) {
      logger.info(`No commands found matching "${query}"`)
      return
    }
    
    logger.heading(`Commands matching "${query}" (${commands.length} results)`)
    
    for (const command of commands) {
      const installedMark = installed.includes(command.name) ? chalk.green(' ✓') : ''
      console.log(`\n${chalk.bold(command.prefix + command.name)}${installedMark}`)
      console.log(`  ${command.description}`)
      console.log(`  ${chalk.gray(`Category: ${command.category}`)}`)
      if (command.tags.length > 0) {
        console.log(`  ${chalk.gray(`Tags: ${command.tags.join(', ')}`)}`)
      }
    }
  } catch (error) {
    spinner.fail('Search failed')
    throw error
  }
}

async function searchMCPServers(
  query: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Searching MCP servers for "${query}"...`)
  
  try {
    // Check if Docker MCP is available
    const dockerStatus = await checkDockerMCPStatus()
    
    if (dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable) {
      // Use Docker MCP search
      const results = await searchDockerMCPServers(query)
      const installed = await listInstalledDockerMCPServers()
      
      spinner.stop()
      
      if (results.length === 0) {
        logger.info(`No MCP servers found matching "${query}"`)
        return
      }
      
      logger.heading(`Docker MCP servers matching "${query}" (${results.length} results)`)
      
      for (const server of results) {
        const installedMark = installed.includes(server.name) ? chalk.green(' ✓') : ''
        console.log(`\n${chalk.bold(server.name)}${installedMark}`)
        console.log(`  ${server.description}`)
        if (installed.includes(server.name)) {
          console.log(`  ${chalk.green('Status: Installed and enabled in Docker MCP')}`)
        }
      }
    } else {
      // Fallback to registry search (for backwards compatibility)
      const servers = await registryClient.searchMCPServers(query)
      const installed = await configManager.getInstalledMCPServers()
      
      spinner.stop()
      
      if (servers.length === 0) {
        logger.info(`No MCP servers found matching "${query}"`)
        logger.info('Docker MCP is not available. Install Docker and enable MCP Toolkit for more servers.')
        return
      }
      
      logger.heading(`MCP servers matching "${query}" (${servers.length} results)`)
      
      for (const server of servers) {
        const installedMark = installed.includes(server.name) ? chalk.green(' ✓') : ''
        const verificationIcon = server.verification.status === 'verified' ? '✅' : 
                               server.verification.status === 'community' ? '👥' : '🧪'
        console.log(`\n${verificationIcon} ${chalk.bold(server.name)}${installedMark}`)
        console.log(`  ${server.description}`)
        console.log(`  ${chalk.gray(`Category: ${server.category}`)}`)
        console.log(`  ${chalk.gray(`Type: ${server.server_type}`)}`)
        if (server.tags && server.tags.length > 0) {
          console.log(`  ${chalk.gray(`Tags: ${server.tags.join(', ')}`)}`)
        }
      }
    }
  } catch (error) {
    spinner.fail('Search failed')
    throw error
  }
}