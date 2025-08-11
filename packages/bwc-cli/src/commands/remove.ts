import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { logger } from '../utils/logger.js'
import { deleteFile, fileExists } from '../utils/files.js'
import { removeServerFromMCPJson } from '../utils/mcp-json.js'
import { checkDockerMCPStatus, disableDockerMCPServer, listInstalledDockerMCPServers } from '../utils/docker-mcp.js'
import { removeFromClaudeCode } from '../utils/mcp-remover.js'

export function createRemoveCommand() {
  const remove = new Command('remove')
    .description('Remove subagents, commands, or MCP servers')
    .option('-a, --agent <name>', 'remove a specific subagent')
    .option('-c, --command <name>', 'remove a specific command')
    .option('-m, --mcp <name>', 'remove a specific MCP server')
    .option('-g, --global', 'force user-level removal (for subagents/commands)')
    .option('-u, --user', 'force user-level removal (alias for --global)')
    .option('-s, --scope <scope>', 'configuration scope for MCP servers: local, user, or project')
    .option('-y, --yes', 'skip confirmation prompt')
    .action(async (options) => {
      try {
        const configManager = ConfigManager.getInstance()
        
        // Handle --user as alias for --global
        const forceUserLevel = options.global || options.user
        
        // If force user level is requested, load user config
        if (forceUserLevel) {
          await configManager.loadUserConfig()
        }
        
        // Check if using project config
        const isProject = await configManager.isUsingProjectConfig()
        
        if (isProject && !forceUserLevel) {
          logger.info('Removing from project configuration')
        } else if (forceUserLevel) {
          logger.info('Removing from user configuration')
        }

        if (options.agent) {
          await removeSubagent(options.agent, configManager, options.yes, forceUserLevel)
        } else if (options.command) {
          await removeCommand(options.command, configManager, options.yes, forceUserLevel)
        } else if (options.mcp) {
          // Validate scope if provided
          if (options.scope) {
            const validScopes = ['local', 'user', 'project']
            if (!validScopes.includes(options.scope)) {
              throw new Error(`Invalid scope: ${options.scope}. Must be one of: ${validScopes.join(', ')}`)
            }
          }
          await removeMCPServer(options.mcp, configManager, options.yes, options.scope)
        } else {
          await interactiveRemove(configManager, forceUserLevel)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return remove
}

async function removeSubagent(
  name: string,
  configManager: ConfigManager,
  skipConfirmation: boolean,
  forceUserLevel: boolean = false
): Promise<void> {
  const installed = await configManager.getInstalledSubagents()
  
  if (!installed.includes(name)) {
    logger.warn(`Subagent "${name}" is not installed`)
    return
  }
  
  if (!skipConfirmation) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove subagent "${name}"?`,
        default: false
      }
    ])
    
    if (!confirm) {
      logger.info('Removal cancelled')
      return
    }
  }
  
  const spinner = logger.spinner(`Removing subagent: ${name}`)
  
  try {
    const subagentsPath = await configManager.getSubagentsPath()
    const filePath = path.join(subagentsPath, `${name}.md`)
    
    if (await fileExists(filePath)) {
      await deleteFile(filePath)
    }
    
    await configManager.removeInstalledSubagent(name)
    
    spinner.succeed(`Successfully removed subagent: ${name}`)
  } catch (error) {
    spinner.fail('Failed to remove subagent')
    throw error
  }
}

async function removeCommand(
  name: string,
  configManager: ConfigManager,
  skipConfirmation: boolean,
  forceUserLevel: boolean = false
): Promise<void> {
  const installed = await configManager.getInstalledCommands()
  
  if (!installed.includes(name)) {
    logger.warn(`Command "${name}" is not installed`)
    return
  }
  
  if (!skipConfirmation) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove command "${name}"?`,
        default: false
      }
    ])
    
    if (!confirm) {
      logger.info('Removal cancelled')
      return
    }
  }
  
  const spinner = logger.spinner(`Removing command: ${name}`)
  
  try {
    const commandsPath = await configManager.getCommandsPath()
    const filePath = path.join(commandsPath, `${name}.md`)
    
    if (await fileExists(filePath)) {
      await deleteFile(filePath)
    }
    
    await configManager.removeInstalledCommand(name)
    
    spinner.succeed(`Successfully removed command: ${name}`)
  } catch (error) {
    spinner.fail('Failed to remove command')
    throw error
  }
}

async function removeMCPServer(
  name: string,
  configManager: ConfigManager,
  skipConfirmation: boolean,
  scope?: 'local' | 'user' | 'project'
): Promise<void> {
  // Check if Docker MCP is available
  const dockerStatus = await checkDockerMCPStatus()
  
  if (dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable) {
    // Check if it's a Docker MCP server
    const dockerInstalled = await listInstalledDockerMCPServers()
    if (dockerInstalled.includes(name)) {
      await removeDockerMCPServer(name, configManager, skipConfirmation, scope)
      return
    }
  }
  
  // Fallback to regular removal
  const installed = await configManager.getInstalledMCPServers()
  
  if (!installed.includes(name)) {
    logger.warn(`MCP server "${name}" is not installed`)
    return
  }
  
  if (!skipConfirmation) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove MCP server "${name}"?`,
        default: false
      }
    ])
    
    if (!confirm) {
      logger.info('Removal cancelled')
      return
    }
  }
  
  const spinner = logger.spinner(`Removing MCP server: ${name}`)
  
  try {
    // Remove from BWC config
    await configManager.removeInstalledMCPServer(name)
    
    // Also try to remove from .mcp.json if it exists
    const removedFromProject = await removeServerFromMCPJson(name)
    
    // Try to remove from Claude Code using Claude CLI
    const removedFromClaude = await removeFromClaudeCode(name, { scope })
    
    spinner.succeed(`Successfully removed MCP server: ${name}`)
    
    if (removedFromProject) {
      logger.info('Removed from .mcp.json (project scope)')
    }
    
    if (removedFromClaude) {
      logger.info(`Removed from Claude Code${scope ? ` (${scope} scope)` : ''}`)
    } else if (!removedFromClaude && scope) {
      logger.info(chalk.gray(`Server was not found in Claude Code ${scope} scope or Claude CLI is not available`))
    }
  } catch (error) {
    spinner.fail('Failed to remove MCP server')
    throw error
  }
}

async function removeDockerMCPServer(
  name: string,
  configManager: ConfigManager,
  skipConfirmation: boolean,
  scope?: 'local' | 'user' | 'project'
): Promise<void> {
  if (!skipConfirmation) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove Docker MCP server "${name}"?`,
        default: false
      }
    ])
    
    if (!confirm) {
      logger.info('Removal cancelled')
      return
    }
  }
  
  const spinner = logger.spinner(`Removing Docker MCP server: ${name}`)
  
  try {
    // Disable the server in Docker MCP
    await disableDockerMCPServer(name)
    
    // Remove from BWC config
    await configManager.removeInstalledMCPServer(name)
    
    spinner.succeed(`Successfully removed Docker MCP server: ${name}`)
    logger.info('The server has been disabled in Docker MCP Toolkit')
  } catch (error) {
    spinner.fail('Failed to remove Docker MCP server')
    throw error
  }
}

async function interactiveRemove(configManager: ConfigManager, forceUserLevel: boolean = false): Promise<void> {
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What would you like to remove?',
      choices: [
        { name: 'Subagent', value: 'subagent' },
        { name: 'Command', value: 'command' },
        { name: 'MCP Server', value: 'mcp' }
      ]
    }
  ])

  if (type === 'subagent') {
    await interactiveRemoveSubagent(configManager, forceUserLevel)
  } else if (type === 'command') {
    await interactiveRemoveCommand(configManager, forceUserLevel)
  } else {
    await interactiveRemoveMCP(configManager)
  }
}

async function interactiveRemoveSubagent(configManager: ConfigManager, forceUserLevel: boolean = false): Promise<void> {
  const installed = await configManager.getInstalledSubagents()
  
  if (installed.length === 0) {
    logger.warn('No subagents installed')
    return
  }
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select subagents to remove:',
      choices: installed.map(name => ({ name, value: name })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one subagent!'
        }
        return true
      }
    }
  ])
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove ${selected.length} subagent(s)?`,
      default: false
    }
  ])
  
  if (!confirm) {
    logger.info('Removal cancelled')
    return
  }
  
  for (const name of selected) {
    await removeSubagent(name, configManager, true, forceUserLevel)
  }
}

async function interactiveRemoveCommand(configManager: ConfigManager, forceUserLevel: boolean = false): Promise<void> {
  const installed = await configManager.getInstalledCommands()
  
  if (installed.length === 0) {
    logger.warn('No commands installed')
    return
  }
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select commands to remove:',
      choices: installed.map(name => ({ name, value: name })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one command!'
        }
        return true
      }
    }
  ])
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove ${selected.length} command(s)?`,
      default: false
    }
  ])
  
  if (!confirm) {
    logger.info('Removal cancelled')
    return
  }
  
  for (const name of selected) {
    await removeCommand(name, configManager, true, forceUserLevel)
  }
}

async function interactiveRemoveMCP(configManager: ConfigManager): Promise<void> {
  const installed = await configManager.getInstalledMCPServers()
  
  if (installed.length === 0) {
    logger.warn('No MCP servers installed')
    return
  }
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select MCP servers to remove:',
      choices: installed.map(name => ({ name, value: name })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one MCP server!'
        }
        return true
      }
    }
  ])
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove ${selected.length} MCP server(s)?`,
      default: false
    }
  ])
  
  if (!confirm) {
    logger.info('Removal cancelled')
    return
  }
  
  for (const name of selected) {
    await removeMCPServer(name, configManager, true)
  }
}