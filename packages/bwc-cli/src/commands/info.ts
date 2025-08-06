import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { readFile, fileExists } from '../utils/files.js'
import { SOURCE_INDICATORS, EXECUTION_INDICATORS } from '../registry/mcp-types.js'

export function createInfoCommand() {
  const info = new Command('info')
    .description('Show detailed information about a subagent, command, or MCP server')
    .option('-a, --agent <name>', 'show info for a specific subagent')
    .option('-c, --command <name>', 'show info for a specific command')
    .option('-m, --mcp <name>', 'show info for a specific MCP server')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)

        if (options.agent) {
          await showSubagentInfo(options.agent, configManager, registryClient)
        } else if (options.command) {
          await showCommandInfo(options.command, configManager, registryClient)
        } else if (options.mcp) {
          await showMCPServerInfo(options.mcp, configManager, registryClient)
        } else {
          logger.error('Please specify a resource type: --agent, --command, or --mcp')
          process.exit(1)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return info
}

async function showSubagentInfo(
  name: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Fetching subagent info: ${name}`)
  
  try {
    const subagent = await registryClient.findSubagent(name)
    
    if (!subagent) {
      spinner.fail(`Subagent "${name}" not found`)
      return
    }
    
    spinner.stop()
    
    const installed = await configManager.getInstalledSubagents()
    const isInstalled = installed.includes(name)
    
    // Display basic info
    console.log(`\n${chalk.bold(subagent.name)}${isInstalled ? chalk.green(' ✓ Installed') : ''}`)
    console.log(`${subagent.description}\n`)
    
    // Display metadata
    console.log(chalk.bold('Category:'), subagent.category)
    console.log(chalk.bold('Tools:'), subagent.tools.join(', '))
    if (subagent.tags.length > 0) {
      console.log(chalk.bold('Tags:'), subagent.tags.join(', '))
    }
    
    // Display installation status
    if (isInstalled) {
      const subagentsPath = await configManager.getSubagentsPath()
      const filePath = path.join(subagentsPath, `${name}.md`)
      console.log(chalk.bold('Location:'), filePath)
      
      // Show a preview of the file content if it exists
      if (await fileExists(filePath)) {
        const content = await readFile(filePath)
        const lines = content.split('\n')
        const preview = lines.slice(0, 5).join('\n')
        console.log(`\n${chalk.bold('Preview:')}\n${chalk.gray(preview)}`)
        if (lines.length > 5) {
          console.log(chalk.gray(`... (${lines.length - 5} more lines)`))
        }
      }
    } else {
      console.log(`\n${chalk.yellow('Not installed')}`)
      console.log(`Run ${chalk.cyan(`bwc add --agent ${name}`)} to install`)
    }
  } catch (error) {
    spinner.fail('Failed to fetch subagent info')
    throw error
  }
}

async function showCommandInfo(
  name: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Fetching command info: ${name}`)
  
  try {
    const command = await registryClient.findCommand(name)
    
    if (!command) {
      spinner.fail(`Command "${name}" not found`)
      return
    }
    
    spinner.stop()
    
    const installed = await configManager.getInstalledCommands()
    const isInstalled = installed.includes(name)
    
    // Display basic info
    console.log(`\n${chalk.bold(command.prefix + command.name)}${isInstalled ? chalk.green(' ✓ Installed') : ''}`)
    console.log(`${command.description}\n`)
    
    // Display metadata
    console.log(chalk.bold('Category:'), command.category)
    if (command.tags.length > 0) {
      console.log(chalk.bold('Tags:'), command.tags.join(', '))
    }
    
    // Display installation status
    if (isInstalled) {
      const commandsPath = await configManager.getCommandsPath()
      const filePath = path.join(commandsPath, `${name}.md`)
      console.log(chalk.bold('Location:'), filePath)
      
      // Show a preview of the file content if it exists
      if (await fileExists(filePath)) {
        const content = await readFile(filePath)
        const lines = content.split('\n')
        const preview = lines.slice(0, 5).join('\n')
        console.log(`\n${chalk.bold('Preview:')}\n${chalk.gray(preview)}`)
        if (lines.length > 5) {
          console.log(chalk.gray(`... (${lines.length - 5} more lines)`))
        }
      }
    } else {
      console.log(`\n${chalk.yellow('Not installed')}`)
      console.log(`Run ${chalk.cyan(`bwc add --command ${name}`)} to install`)
    }
  } catch (error) {
    spinner.fail('Failed to fetch command info')
    throw error
  }
}

async function showMCPServerInfo(
  name: string,
  configManager: ConfigManager,
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Fetching MCP server info: ${name}`)
  
  try {
    const server = await registryClient.findMCPServer(name)
    
    if (!server) {
      spinner.fail(`MCP server "${name}" not found`)
      return
    }
    
    spinner.stop()
    
    const installed = await configManager.getInstalledMCPServers()
    const isInstalled = installed.includes(name)
    
    // Display basic info
    const verificationIcon = server.verification.status === 'verified' ? '✅' : 
                           server.verification.status === 'community' ? '👥' : '🧪'
    console.log(`\n${verificationIcon} ${chalk.bold(server.display_name)}${isInstalled ? chalk.green(' ✓ Installed') : ''}`)
    console.log(`${server.description}\n`)
    
    // Display metadata
    console.log(chalk.bold('Details:'))
    console.log(`  Category: ${server.category}`)
    console.log(`  Server Type: ${server.server_type}`)
    console.log(`  Protocol Version: ${server.protocol_version}`)
    console.log(`  Verification: ${server.verification.status}`)
    
    // Display source and execution info
    if (server.source_registry) {
      const sourceInfo = SOURCE_INDICATORS[server.source_registry.type]
      if (sourceInfo) {
        console.log(`  Source: ${sourceInfo.icon} ${sourceInfo.label}`)
      }
    }
    
    if (server.execution_type) {
      const execInfo = EXECUTION_INDICATORS[server.execution_type]
      if (execInfo) {
        console.log(`  Execution: ${execInfo.icon} ${execInfo.label} - ${execInfo.description}`)
      }
    }
    
    // Display badges if available
    if (server.badges && server.badges.length > 0) {
      console.log(`  Badges: ${server.badges.join(', ')}`)
    }
    
    // Display security info
    if (server.security) {
      console.log(`\n${chalk.bold('Security:')}`)
      console.log(`  Authentication: ${server.security.auth_type}`)
      console.log(`  Permissions: ${server.security.permissions.join(', ')}`)
    }
    
    // Display stats
    if (server.stats) {
      console.log(`\n${chalk.bold('Stats:')}`)
      if (server.stats.github_stars) console.log(`  GitHub Stars: ⭐ ${server.stats.github_stars}`)
      if (server.stats.docker_pulls) console.log(`  Docker Pulls: 🐳 ${server.stats.docker_pulls}`)
      if (server.stats.npm_downloads) console.log(`  NPM Downloads: 📦 ${server.stats.npm_downloads}`)
    }
    
    // Display installation methods
    console.log(`\n${chalk.bold('Installation Methods:')}`)
    server.installation_methods.forEach(method => {
      const recommended = method.recommended ? ' (recommended)' : ''
      console.log(`  - ${method.type}${recommended}`)
    })
    
    // Display sources
    console.log(`\n${chalk.bold('Sources:')}`)
    if (server.sources.official) console.log(`  Official: ${server.sources.official}`)
    if (server.sources.docker) console.log(`  Docker: ${server.sources.docker}`)
    if (server.sources.npm) console.log(`  NPM: ${server.sources.npm}`)
    
    // Display tested with
    if (server.verification.tested_with && server.verification.tested_with.length > 0) {
      console.log(`\n${chalk.bold('Tested With:')}`)
      console.log(`  ${server.verification.tested_with.join(', ')}`)
    }
    
    // Display tags
    if (server.tags && server.tags.length > 0) {
      console.log(`\n${chalk.bold('Tags:')} ${server.tags.join(', ')}`)
    }
    
    // Display installation status
    if (isInstalled) {
      console.log(`\n${chalk.green('✓ Installed')}`)
      console.log(chalk.gray('Configuration has been added to your BWC config'))
    } else {
      console.log(`\n${chalk.yellow('Not installed')}`)
      console.log(`Run ${chalk.cyan(`bwc add --mcp ${name}`)} to install`)
    }
  } catch (error) {
    spinner.fail('Failed to fetch MCP server info')
    throw error
  }
}