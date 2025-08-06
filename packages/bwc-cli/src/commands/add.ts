import { Command } from 'commander'
import inquirer from 'inquirer'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { writeFile } from '../utils/files.js'
import { installMCPServer, configureInClaudeCode } from '../utils/mcp-installer.js'
import { addServerToMCPJson } from '../utils/mcp-json.js'
import { UserInputHandler } from '../utils/user-input-handler.js'

export function createAddCommand() {
  const add = new Command('add')
    .description('Add subagents, commands, or MCP servers')
    .option('-a, --agent <name>', 'add a specific subagent')
    .option('-c, --command <name>', 'add a specific command')
    .option('-m, --mcp <name>', 'add a specific MCP server')
    .option('-g, --global', 'force global installation (for subagents/commands)')
    .option('-s, --scope <scope>', 'configuration scope for MCP servers: local, user, or project (default: "local")')
    .option('-e, --env <env...>', 'set environment variables for MCP servers (e.g. -e KEY=value)')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)

        // Check if using project config
        const isProject = await configManager.isUsingProjectConfig()
        
        if (isProject && !options.global) {
          logger.info('Installing to project configuration')
        }

        if (options.agent) {
          await addSubagent(options.agent, configManager, registryClient)
        } else if (options.command) {
          await addCommand(options.command, configManager, registryClient)
        } else if (options.mcp) {
          // Validate scope
          const validScopes = ['local', 'user', 'project']
          const scope = options.scope || 'local'
          if (!validScopes.includes(scope)) {
            throw new Error(`Invalid scope: ${scope}. Must be one of: ${validScopes.join(', ')}`)
          }
          
          await addMCPServer(options.mcp, configManager, registryClient, {
            scope,
            envVars: options.env || []
          })
        } else {
          await interactiveAdd(configManager, registryClient)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return add
}

async function addSubagent(
  name: string, 
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Fetching subagent: ${name}`)
  
  try {
    const subagent = await registryClient.findSubagent(name)
    
    if (!subagent) {
      spinner.fail(`Subagent "${name}" not found`)
      return
    }
    
    spinner.text = `Downloading ${subagent.name}...`
    
    const content = await registryClient.fetchFileContent(subagent.file)
    const subagentsPath = await configManager.getSubagentsPath()
    const filePath = path.join(subagentsPath, `${subagent.name}.md`)
    
    await writeFile(filePath, content)
    await configManager.addInstalledSubagent(subagent.name)
    
    spinner.succeed(`Successfully installed subagent: ${subagent.name}`)
    logger.info(`Location: ${filePath}`)
    logger.info(`Tools: ${subagent.tools.join(', ')}`)
  } catch (error) {
    spinner.fail('Failed to add subagent')
    throw error
  }
}

async function addCommand(
  name: string, 
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  const spinner = logger.spinner(`Fetching command: ${name}`)
  
  try {
    const command = await registryClient.findCommand(name)
    
    if (!command) {
      spinner.fail(`Command "${name}" not found`)
      return
    }
    
    spinner.text = `Downloading ${command.name}...`
    
    const content = await registryClient.fetchFileContent(command.file)
    const commandsPath = await configManager.getCommandsPath()
    const filePath = path.join(commandsPath, `${command.name}.md`)
    
    await writeFile(filePath, content)
    await configManager.addInstalledCommand(command.name)
    
    spinner.succeed(`Successfully installed command: ${command.prefix}${command.name}`)
    logger.info(`Location: ${filePath}`)
  } catch (error) {
    spinner.fail('Failed to add command')
    throw error
  }
}

async function interactiveAdd(
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  try {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What would you like to add?',
        choices: [
          { name: 'Subagent', value: 'subagent' },
          { name: 'Command', value: 'command' },
          { name: 'MCP Server', value: 'mcp' }
        ]
      }
    ])

    if (type === 'subagent') {
      await interactiveAddSubagent(configManager, registryClient)
    } else if (type === 'command') {
      await interactiveAddCommand(configManager, registryClient)
    } else {
      await interactiveAddMCP(configManager, registryClient)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch registry')) {
      logger.error('Failed to connect to registry. Please check your internet connection.')
      logger.info('Registry URL: ' + await configManager.getRegistryUrl())
    } else {
      throw error
    }
  }
}

async function interactiveAddSubagent(
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  const subagents = await registryClient.getSubagents()
  
  const categories = [...new Set(subagents.map(s => s.category))].sort()
  
  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Select a category:',
      choices: ['All', ...categories]
    }
  ])

  const filteredSubagents = category === 'All' 
    ? subagents 
    : subagents.filter(s => s.category === category)

  logger.info('Use SPACE to select/deselect, ENTER to confirm')
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select subagents to install:',
      choices: filteredSubagents.map(s => ({
        name: `${s.name} - ${s.description}`,
        value: s.name,
        short: s.name
      })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one subagent!'
        }
        return true
      }
    }
  ])

  if (!selected || selected.length === 0) {
    logger.warn('No subagents selected')
    return
  }

  logger.info(`Installing ${selected.length} subagent(s)...`)
  
  for (const name of selected) {
    await addSubagent(name, configManager, registryClient)
  }
}

async function interactiveAddCommand(
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  const commands = await registryClient.getCommands()
  
  const categories = [...new Set(commands.map(c => c.category))].sort()
  
  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Select a category:',
      choices: ['All', ...categories]
    }
  ])

  const filteredCommands = category === 'All' 
    ? commands 
    : commands.filter(c => c.category === category)

  logger.info('Use SPACE to select/deselect, ENTER to confirm')
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select commands to install:',
      choices: filteredCommands.map(c => ({
        name: `${c.prefix}${c.name} - ${c.description}`,
        value: c.name,
        short: c.name
      })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one command!'
        }
        return true
      }
    }
  ])

  if (!selected || selected.length === 0) {
    logger.warn('No commands selected')
    return
  }

  logger.info(`Installing ${selected.length} command(s)...`)
  
  for (const name of selected) {
    await addCommand(name, configManager, registryClient)
  }
}

interface MCPOptions {
  scope: 'local' | 'user' | 'project'
  envVars: string[]
}

async function addMCPServer(
  name: string, 
  configManager: ConfigManager, 
  registryClient: RegistryClient,
  options: MCPOptions = { scope: 'local', envVars: [] }
): Promise<void> {
  const spinner = logger.spinner(`Fetching MCP server: ${name}`)
  
  try {
    const server = await registryClient.findMCPServer(name)
    
    if (!server) {
      spinner.fail(`MCP server "${name}" not found`)
      return
    }
    
    spinner.stop()
    
    // Show server details
    logger.info(`\n${server.display_name} - ${server.description}`)
    logger.info(`Verification: ${server.verification.status}`)
    
    // Security warning for experimental servers
    if (server.verification.status === 'experimental') {
      logger.warn('⚠️  This is an experimental server. Use with caution.')
    }
    
    // Select installation method - prefer claude-cli method
    let method = server.installation_methods.find(m => m.type === 'claude-cli' && m.recommended)
    if (!method) {
      // Fall back to other methods
      if (server.user_inputs && server.user_inputs.length > 0) {
        // Find the recommended non-BWC method or use the first available non-BWC method
        method = server.installation_methods.find(m => m.type !== 'bwc' && m.recommended) || 
                 server.installation_methods.find(m => m.type !== 'bwc')
      } else {
        // Find the recommended method or use the first available
        method = server.installation_methods.find(m => m.recommended) || server.installation_methods[0]
      }
    }
    
    if (!method) {
      logger.error('No installation methods available for this server')
      return
    }
    
    // Check if server requires user inputs
    let userInputs: Record<string, any> = {}
    let updatedConfigExample = method.config_example
    
    if (server.user_inputs && server.user_inputs.length > 0) {
      spinner.stop()
      
      // Collect user inputs
      const inputHandler = new UserInputHandler()
      userInputs = await inputHandler.collectInputs(server)
      
      // Validate inputs
      const validation = await inputHandler.validateInputs(userInputs, server)
      if (!validation.valid) {
        logger.error('Invalid inputs:')
        validation.errors.forEach(error => logger.error(`  - ${error}`))
        throw new Error('Invalid configuration inputs')
      }
      
      // Show summary
      inputHandler.showInputSummary(userInputs, server)
      
      // Apply inputs to config
      if (method.config_example) {
        try {
          const config = JSON.parse(method.config_example)
          const updatedConfig = await inputHandler.applyInputsToConfig(config, userInputs, server)
          updatedConfigExample = JSON.stringify(updatedConfig, null, 2)
          
          // Update the method with the new config
          method = { ...method, config_example: updatedConfigExample }
        } catch (error) {
          logger.warn('Could not apply user inputs to config automatically')
          logger.warn(`Error: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      
      spinner.start()
    }
    
    spinner.text = `Installing ${server.name} using ${method.type}...`
    
    try {
      // Execute the actual installation
      await installMCPServer(server, method)
      
      spinner.succeed(`Successfully installed ${server.name}`)
      
      // Handle different scopes
      if (options.scope === 'project') {
        // For project scope, update .mcp.json with user inputs applied
        await addServerToMCPJson(server, updatedConfigExample, options.envVars)
      }
      
      // Update BWC config to track installation
      await configManager.addInstalledMCPServer(server.name)
      
      // Configure in Claude Code with appropriate scope and updated config
      await configureInClaudeCode(server, method, options)
      
      // Show scope-specific information
      logger.info(`\nMCP server configured with ${options.scope} scope`)
      
      if (options.scope === 'project') {
        logger.info('The server is now available to all team members via .mcp.json')
      } else if (options.scope === 'user') {
        logger.info('The server is now available across all your projects')
      } else {
        logger.info('The server is available for this project only')
      }
      
    } catch (installError) {
      spinner.fail(`Failed to install ${server.name}`)
      throw installError
    }
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Failed to add MCP server')
    }
    throw error
  }
}

async function interactiveAddMCP(
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  // First ask for scope
  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: 'Select configuration scope for MCP servers:',
      choices: [
        { name: 'Local (this project only)', value: 'local' },
        { name: 'Project (shared with team via .mcp.json)', value: 'project' },
        { name: 'User (across all your projects)', value: 'user' }
      ],
      default: 'local'
    }
  ])
  
  const servers = await registryClient.getMCPServers()
  
  // Group by verification status
  const verificationGroups = servers.reduce((acc, server) => {
    const status = server.verification.status
    if (!acc[status]) acc[status] = []
    acc[status].push(server)
    return acc
  }, {} as Record<string, typeof servers>)
  
  const { verification } = await inquirer.prompt([
    {
      type: 'list',
      name: 'verification',
      message: 'Select verification status:',
      choices: ['All', 'verified', 'community', 'experimental']
    }
  ])

  const filteredServers = verification === 'All' 
    ? servers 
    : verificationGroups[verification] || []

  logger.info('Use SPACE to select/deselect, ENTER to confirm')
  
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select MCP servers to install:',
      choices: filteredServers.map(s => ({
        name: `${s.name} - ${s.description}`,
        value: s.name,
        short: s.name
      })),
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one MCP server!'
        }
        return true
      }
    }
  ])

  if (!selected || selected.length === 0) {
    logger.warn('No MCP servers selected')
    return
  }

  // Ask for environment variables if project scope
  let envVars: string[] = []
  if (scope === 'project') {
    const { hasEnvVars } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasEnvVars',
        message: 'Do you need to set environment variables?',
        default: false
      }
    ])
    
    if (hasEnvVars) {
      const { envInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'envInput',
          message: 'Enter environment variables (e.g., API_KEY=value SECRET=value):',
          validate: (input) => {
            if (!input.trim()) return 'Please enter at least one environment variable'
            return true
          }
        }
      ])
      envVars = envInput.split(' ').filter((e: string) => e.includes('='))
    }
  }
  
  logger.info(`Installing ${selected.length} MCP server(s) with ${scope} scope...`)
  
  let successCount = 0
  let failureCount = 0
  
  for (const name of selected) {
    try {
      await addMCPServer(name, configManager, registryClient, { scope, envVars })
      successCount++
    } catch (error) {
      logger.error(`Failed to install ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failureCount++
    }
  }
  
  if (successCount > 0) {
    logger.success(`\nSuccessfully installed ${successCount} MCP server(s)`)
  }
  if (failureCount > 0) {
    logger.warn(`Failed to install ${failureCount} MCP server(s)`)
  }
}