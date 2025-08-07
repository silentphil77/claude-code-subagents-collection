import { Command } from 'commander'
import chalk from 'chalk'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { SOURCE_INDICATORS, EXECUTION_INDICATORS } from '../registry/mcp-types.js'
import { 
  checkDockerMCPStatus, 
  listAvailableDockerMCPServers, 
  listInstalledDockerMCPServers, 
  getDockerMCPServerInfo,
  getDockerMCPServersGroupedByCategory,
  getDockerMCPServersByCategory
} from '../utils/docker-mcp.js'
import { getCategoryInfo, DOCKER_MCP_CATEGORIES } from '../utils/mcp-categorizer.js'

export function createListCommand() {
  const list = new Command('list')
    .description('List available subagents, commands, and MCP servers')
    .option('-a, --agents', 'list subagents only')
    .option('-c, --commands', 'list commands only')
    .option('-m, --mcps', 'list MCP servers only')
    .option('--category <category>', 'filter by category (for MCP servers: ai, data, devops, cloud, etc.)')
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
  // Check if Docker MCP is available
  const dockerStatus = await checkDockerMCPStatus()
  
  if (dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable) {
    // Use Docker MCP listing
    await listDockerMCPServers(configManager, options)
  } else {
    // Fallback to registry-based listing
    await listRegistryMCPServers(configManager, registryClient, options)
  }
}

async function listDockerMCPServers(
  configManager: ConfigManager,
  options: { category?: string; installed?: boolean }
): Promise<void> {
  const spinner = logger.spinner('Fetching Docker MCP servers...')
  
  try {
    // Get servers grouped by category
    const serversByCategory = await getDockerMCPServersGroupedByCategory()
    const installed = await listInstalledDockerMCPServers()
    
    spinner.stop()
    
    logger.heading('Docker MCP Servers')
    
    const status = await checkDockerMCPStatus()
    if (!status.gatewayConfigured) {
      logger.warn('⚠️  Gateway not configured. Run "bwc add --setup" to connect to Claude Code\n')
    } else {
      logger.success('✅ Gateway connected to Claude Code\n')
    }
    
    // Filter by category if specified
    let categoriesToShow = Object.keys(serversByCategory)
    if (options.category) {
      if (!serversByCategory[options.category]) {
        logger.warn(`No servers found in category: ${options.category}`)
        logger.info(`Available categories: ${Object.keys(DOCKER_MCP_CATEGORIES).join(', ')}`)
        return
      }
      categoriesToShow = [options.category]
    }
    
    // Count total servers
    const totalServers = Object.values(serversByCategory).reduce((acc, servers) => acc + servers.length, 0)
    
    if (options.installed) {
      logger.info(chalk.bold(`Installed Servers (${installed.length}):\n`))
    } else if (options.category) {
      const categoryInfo = getCategoryInfo(options.category)
      logger.info(chalk.bold(`${categoryInfo.icon} ${categoryInfo.name} (${serversByCategory[options.category].length} servers):\n`))
    } else {
      logger.info(chalk.bold(`Total: ${totalServers} servers (${installed.length} installed)\n`))
    }
    
    // Display servers by category
    for (const categoryId of categoriesToShow.sort()) {
      const servers = serversByCategory[categoryId]
      const categoryInfo = getCategoryInfo(categoryId)
      
      if (!options.category) {
        console.log(chalk.yellow(`${categoryInfo.icon} ${categoryInfo.name}:`))
      }
      
      // Filter by installed if needed
      let serversToShow = servers
      if (options.installed) {
        serversToShow = servers.filter(s => installed.includes(s.name))
        if (serversToShow.length === 0) continue
      }
      
      for (const server of serversToShow.sort((a, b) => a.name.localeCompare(b.name))) {
        const isInstalled = installed.includes(server.name)
        const marker = isInstalled ? chalk.green('✓') : chalk.gray('○')
        const displayName = isInstalled ? chalk.green(server.name) : server.name
        
        console.log(`  ${marker} ${chalk.bold(displayName)}`)
        
        // Show description for smaller lists or when filtered
        if (options.category || serversToShow.length < 20) {
          const desc = server.description.substring(0, 70)
          console.log(chalk.gray(`    ${desc}${server.description.length > 70 ? '...' : ''}`))
          console.log(chalk.dim(`    🔗 ${server.dockerHubUrl}`))
        }
      }
      console.log()
    }
    
    // Show helpful commands
    if (!options.installed) {
      logger.info(chalk.dim('Commands:'))
      logger.info(chalk.dim('  bwc add --mcp <name>         Add a specific server'))
      logger.info(chalk.dim('  bwc add                      Interactive server selection'))
      logger.info(chalk.dim('  bwc list --mcps --category ai  List AI/ML servers'))
      logger.info(chalk.dim('  bwc remove --mcp <name>      Remove a server'))
    }
    
    if (installed.length > 0 && !options.installed) {
      logger.info(chalk.dim('\nInstalled servers are available in Claude Code through the Docker MCP gateway'))
    }
    
  } catch (error: any) {
    spinner.fail('Failed to fetch Docker MCP servers')
    logger.error(error.message)
  }
}

async function listRegistryMCPServers(
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

function detectCategory(serverName: string): string {
  const name = serverName.toLowerCase()
  
  if (name.includes('aws') || name.includes('azure') || name.includes('gcp')) return '☁️  Cloud'
  if (name.includes('github') || name.includes('git') || name.includes('build')) return '🛠  DevOps'
  if (name.includes('db') || name.includes('database') || name.includes('sql')) return '🗄  Database'
  if (name.includes('api') || name.includes('rest') || name.includes('graphql')) return '🔌 API'
  if (name.includes('monitor') || name.includes('log') || name.includes('metric')) return '📊 Monitoring'
  if (name.includes('slack') || name.includes('discord') || name.includes('email')) return '💬 Communication'
  if (name.includes('notion') || name.includes('todo') || name.includes('task')) return '📝 Productivity'
  if (name.includes('search') || name.includes('index')) return '🔍 Search'
  if (name.includes('auth') || name.includes('security')) return '🔒 Security'
  if (name.includes('browser') || name.includes('web') || name.includes('scrape')) return '🌐 Web'
  
  return '📦 Other'
}