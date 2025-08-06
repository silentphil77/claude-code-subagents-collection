import { Command } from 'commander'
import chalk from 'chalk'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { SOURCE_INDICATORS, EXECUTION_INDICATORS } from '../registry/mcp-types.js'

export function createListCommand() {
  const list = new Command('list')
    .description('List available subagents, commands, and MCP servers')
    .option('-a, --agents', 'list subagents only')
    .option('-c, --commands', 'list commands only')
    .option('-m, --mcps', 'list MCP servers only')
    .option('--category <category>', 'filter by category')
    .option('--installed', 'show only installed items')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)

        // Show config location
        const isProject = await configManager.isUsingProjectConfig()
        const configLocation = await configManager.getConfigLocation()
        const scope = isProject ? 'project' : 'global'
        
        logger.info(`Using ${scope} configuration: ${configLocation}`)
        console.log()

        if (options.agents) {
          await listSubagents(configManager, registryClient, options)
        } else if (options.commands) {
          await listCommands(configManager, registryClient, options)
        } else if (options.mcps) {
          await listMCPServers(configManager, registryClient, options)
        } else {
          await listSubagents(configManager, registryClient, options)
          console.log()
          await listCommands(configManager, registryClient, options)
          console.log()
          await listMCPServers(configManager, registryClient, options)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return list
}

async function listSubagents(
  configManager: ConfigManager,
  registryClient: RegistryClient,
  options: { category?: string; installed?: boolean }
): Promise<void> {
  const spinner = logger.spinner('Fetching subagents...')
  
  try {
    let subagents = await registryClient.getSubagents()
    const installed = await configManager.getInstalledSubagents()
    
    if (options.category) {
      subagents = subagents.filter(s => s.category === options.category)
    }
    
    if (options.installed) {
      subagents = subagents.filter(s => installed.includes(s.name))
    }
    
    spinner.stop()
    
    logger.heading('Available Subagents')
    
    const categories = [...new Set(subagents.map(s => s.category))].sort()
    
    for (const category of categories) {
      const categorySubagents = subagents.filter(s => s.category === category)
      
      console.log(`\n${chalk.cyan(category)}:`)
      
      for (const subagent of categorySubagents) {
        const installedMark = installed.includes(subagent.name) ? chalk.green(' ✓') : ''
        console.log(`  ${chalk.bold(subagent.name)}${installedMark} - ${subagent.description}`)
        console.log(`    ${chalk.gray(`Tools: ${subagent.tools.join(', ')}`)}`)
      }
    }
    
    console.log(`\n${chalk.gray(`Total: ${subagents.length} subagents`)}`)
  } catch (error) {
    spinner.fail('Failed to fetch subagents')
    throw error
  }
}

async function listCommands(
  configManager: ConfigManager,
  registryClient: RegistryClient,
  options: { category?: string; installed?: boolean }
): Promise<void> {
  const spinner = logger.spinner('Fetching commands...')
  
  try {
    let commands = await registryClient.getCommands()
    const installed = await configManager.getInstalledCommands()
    
    if (options.category) {
      commands = commands.filter(c => c.category === options.category)
    }
    
    if (options.installed) {
      commands = commands.filter(c => installed.includes(c.name))
    }
    
    spinner.stop()
    
    logger.heading('Available Commands')
    
    const categories = [...new Set(commands.map(c => c.category))].sort()
    
    for (const category of categories) {
      const categoryCommands = commands.filter(c => c.category === category)
      
      console.log(`\n${chalk.cyan(category)}:`)
      
      for (const command of categoryCommands) {
        const installedMark = installed.includes(command.name) ? chalk.green(' ✓') : ''
        console.log(`  ${chalk.bold(command.prefix + command.name)}${installedMark} - ${command.description}`)
      }
    }
    
    console.log(`\n${chalk.gray(`Total: ${commands.length} commands`)}`)
  } catch (error) {
    spinner.fail('Failed to fetch commands')
    throw error
  }
}

async function listMCPServers(
  configManager: ConfigManager,
  registryClient: RegistryClient,
  options: { category?: string; installed?: boolean }
): Promise<void> {
  const spinner = logger.spinner('Fetching MCP servers...')
  
  try {
    let servers = await registryClient.getMCPServers()
    const installed = await configManager.getInstalledMCPServers()
    
    if (options.category) {
      servers = servers.filter(s => s.category === options.category)
    }
    
    if (options.installed) {
      servers = servers.filter(s => installed.includes(s.name))
    }
    
    spinner.stop()
    
    logger.heading('Available MCP Servers')
    
    const categories = [...new Set(servers.map(s => s.category))].sort()
    
    for (const category of categories) {
      const categoryServers = servers.filter(s => s.category === category)
      
      console.log(`\n${chalk.cyan(category)}:`)
      
      for (const server of categoryServers) {
        const installedMark = installed.includes(server.name) ? chalk.green(' ✓') : ''
        const verificationIcon = server.verification.status === 'verified' ? '✅' : 
                               server.verification.status === 'community' ? '👥' : '🧪'
        
        // Get source and execution indicators
        const sourceInfo = server.source_registry ? SOURCE_INDICATORS[server.source_registry.type] : null
        const sourceIcon = sourceInfo?.icon || '📦'
        const sourceLabel = sourceInfo?.label || 'Unknown'
        
        const execInfo = server.execution_type ? EXECUTION_INDICATORS[server.execution_type] : EXECUTION_INDICATORS.local
        const execIcon = execInfo.icon
        const execLabel = execInfo.label
        
        console.log(`  ${verificationIcon} ${chalk.bold(server.name)}${installedMark} - ${server.description}`)
        console.log(`    ${chalk.gray(`${sourceIcon} ${sourceLabel} | ${execIcon} ${execLabel} | Type: ${server.server_type}`)}`)
      }
    }
    
    console.log(`\n${chalk.gray(`Total: ${servers.length} MCP servers`)}`)
  } catch (error) {
    spinner.fail('Failed to fetch MCP servers')
    throw error
  }
}