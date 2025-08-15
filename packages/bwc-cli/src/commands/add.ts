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
import type { MCPServerConfig } from '../registry/types.js'
import { convertToMCPJsonFormat, shouldAddToMCPJson } from '../utils/mcp-config-converter.js'
import { 
  isDockerMCPAvailable, 
  enableDockerMCPServer, 
  getDockerMCPServerInfo,
  checkDockerMCPStatus,
  setupDockerMCPGateway,
  listAvailableDockerMCPServers,
  listInstalledDockerMCPServers
} from '../utils/docker-mcp.js'

export function createAddCommand() {
  const add = new Command('add')
    .description('Add subagents, commands, or MCP servers')
    .option('-a, --agent <name>', 'add a specific subagent')
    .option('-c, --command <name>', 'add a specific command')
    .option('-m, --mcp <name>', 'add a specific MCP server')
    .option('-u, --user', 'force user-level installation (for subagents/commands)')
    .option('-p, --project', 'force project-level installation (for subagents/commands)')
    .option('-s, --scope <scope>', 'configuration scope for MCP servers: local, user, or project (default: "local")')
    .option('-e, --env <env...>', 'set environment variables for MCP servers (e.g. -e KEY=value)')
    .option('--setup', 'setup Docker MCP gateway in Claude Code')
    .option('--docker-mcp', 'use Docker MCP Toolkit for MCP servers')
    .option('--transport <type>', 'transport type for MCP servers: stdio, sse, or http')
    .option('--url <url>', 'URL for remote MCP servers (required for sse/http transport)')
    .option('--header <header...>', 'headers for remote MCP servers (e.g. --header "Authorization: Bearer token")')
    .action(async (options) => {
      try {
        const configManager = ConfigManager.getInstance()
        const registryClient = new RegistryClient(configManager)

        // Handle explicit scope overrides
        const forceUserLevel = options.user
        const forceProjectLevel = options.project
        
        // Determine installation scope
        let isProject: boolean
        if (forceProjectLevel) {
          // Check if project config exists when forcing project level
          const projectConfig = configManager.getProjectConfig()
          if (!projectConfig) {
            logger.error('No project configuration found. Run "bwc init --project" first.')
            process.exit(1)
          }
          isProject = true
          logger.info('Installing to project configuration')
        } else if (forceUserLevel) {
          await configManager.loadUserConfig()
          isProject = false
          logger.info('Installing to user configuration')
        } else {
          // Default: use project if it exists
          isProject = await configManager.isUsingProjectConfig()
          if (isProject) {
            logger.info('Installing to project configuration')
          }
        }

        // Handle Docker MCP setup
        if (options.setup) {
          await setupDockerMCPGatewayCommand(options.scope || 'project')
          return
        }

        if (options.agent) {
          await addSubagent(options.agent, configManager, registryClient, forceUserLevel, forceProjectLevel)
        } else if (options.command) {
          await addCommand(options.command, configManager, registryClient, forceUserLevel, forceProjectLevel)
        } else if (options.mcp) {
          // Validate scope
          const validScopes = ['local', 'user', 'project']
          const scope = options.scope || 'local'
          if (!validScopes.includes(scope)) {
            throw new Error(`Invalid scope: ${scope}. Must be one of: ${validScopes.join(', ')}`)
          }
          
          // Determine which provider to use
          if (options.dockerMcp) {
            // Explicitly requested Docker MCP
            await addDockerMCPServer(options.mcp, configManager, scope)
          } else if (options.transport || options.url) {
            // Remote server via Claude CLI (SSE/HTTP transport)
            await addRemoteMCPServer(options.mcp, configManager, {
              scope,
              transport: options.transport,
              url: options.url,
              headers: options.header || [],
              envVars: options.env || []
            })
          } else {
            // Try to find in registry (backwards compatibility)
            await addMCPServer(options.mcp, configManager, registryClient, {
              scope,
              envVars: options.env || []
            })
          }
        } else {
          await interactiveAdd(configManager, registryClient, forceUserLevel, forceProjectLevel)
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
  registryClient: RegistryClient,
  forceUserLevel: boolean = false,
  forceProjectLevel: boolean = false
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
    
    // Check if file already exists
    const { fileExists } = await import('../utils/files.js')
    if (await fileExists(filePath)) {
      spinner.stop()
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: `Subagent "${subagent.name}" already exists. What would you like to do?`,
          choices: [
            { name: 'Overwrite - Replace the existing file with the new one', value: 'overwrite' },
            { name: 'Skip - Skip this item and continue with other installations', value: 'skip' },
            { name: 'Abort - Stop the entire installation process', value: 'abort' }
          ]
        }
      ])
      
      if (action === 'skip') {
        logger.info(`Skipped subagent: ${subagent.name}`)
        return
      } else if (action === 'abort') {
        logger.info('Installation aborted')
        process.exit(0)
      }
      
      spinner.start(`Installing ${subagent.name}...`)
    }
    
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
  registryClient: RegistryClient,
  forceUserLevel: boolean = false,
  forceProjectLevel: boolean = false
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
    
    // Check if file already exists
    const { fileExists } = await import('../utils/files.js')
    if (await fileExists(filePath)) {
      spinner.stop()
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: `Command "${command.name}" already exists. What would you like to do?`,
          choices: [
            { name: 'Overwrite - Replace the existing file with the new one', value: 'overwrite' },
            { name: 'Skip - Skip this item and continue with other installations', value: 'skip' },
            { name: 'Abort - Stop the entire installation process', value: 'abort' }
          ]
        }
      ])
      
      if (action === 'skip') {
        logger.info(`Skipped command: ${command.name}`)
        return
      } else if (action === 'abort') {
        logger.info('Installation aborted')
        process.exit(0)
      }
      
      spinner.start(`Installing ${command.name}...`)
    }
    
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
  registryClient: RegistryClient,
  forceUserLevel: boolean = false,
  forceProjectLevel: boolean = false
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
      await interactiveAddSubagent(configManager, registryClient, forceUserLevel, forceProjectLevel)
    } else if (type === 'command') {
      await interactiveAddCommand(configManager, registryClient, forceUserLevel, forceProjectLevel)
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
  registryClient: RegistryClient,
  forceUserLevel: boolean = false,
  forceProjectLevel: boolean = false
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
    await addSubagent(name, configManager, registryClient, forceUserLevel, forceProjectLevel)
  }
}

async function interactiveAddCommand(
  configManager: ConfigManager, 
  registryClient: RegistryClient,
  forceUserLevel: boolean = false,
  forceProjectLevel: boolean = false
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
    await addCommand(name, configManager, registryClient, forceUserLevel, forceProjectLevel)
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

async function addRemoteMCPServer(
  name: string,
  configManager: ConfigManager,
  options: {
    scope: 'local' | 'user' | 'project'
    transport?: string
    url?: string
    headers?: string[]
    envVars?: string[]
  }
): Promise<void> {
  const spinner = logger.spinner(`Adding remote MCP server: ${name}`)
  
  try {
    // Validate transport and URL
    if (options.transport && !['stdio', 'sse', 'http'].includes(options.transport)) {
      throw new Error(`Invalid transport: ${options.transport}. Must be stdio, sse, or http`)
    }
    
    if ((options.transport === 'sse' || options.transport === 'http') && !options.url) {
      throw new Error(`URL is required for ${options.transport} transport`)
    }
    
    spinner.stop()
    
    // Show server details
    logger.info(`\nAdding remote MCP server: ${name}`)
    logger.info(`Transport: ${options.transport || 'stdio'}`)
    if (options.url) {
      logger.info(`URL: ${options.url}`)
    }
    logger.info(`Scope: ${options.scope}`)
    
    // Parse headers
    const headers: Record<string, string> = {}
    if (options.headers) {
      for (const header of options.headers) {
        const [key, ...valueParts] = header.split(':')
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(':').trim()
        }
      }
    }
    
    // Parse environment variables
    const env: Record<string, string> = {}
    if (options.envVars) {
      for (const envVar of options.envVars) {
        const [key, value] = envVar.split('=')
        if (key && value) {
          env[key] = value
        }
      }
    }
    
    spinner.start()
    
    // Create the MCP server configuration
    const serverConfig: MCPServerConfig = {
      provider: 'claude',
      transport: options.transport || 'stdio',
      scope: options.scope,
      installedAt: new Date().toISOString(),
      ...(options.url && { url: options.url }),
      ...(Object.keys(headers).length > 0 && { headers }),
      ...(Object.keys(env).length > 0 && { env })
    }
    
    // Add to configuration
    await configManager.addInstalledMCPServer(name, serverConfig)
    
    // Configure in Claude Code using Claude CLI
    const { isClaudeCLIAvailable, execClaudeCLI } = await import('../utils/claude-cli.js')
    
    if (await isClaudeCLIAvailable()) {
      spinner.text = `Configuring ${name} in Claude Code...`
      
      const args = ['mcp', 'add', '--scope', options.scope]
      
      if (options.transport) {
        args.push('--transport', options.transport)
      }
      
      // Add headers
      for (const [key, value] of Object.entries(headers)) {
        args.push('--header', `${key}: ${value}`)
      }
      
      // Add environment variables
      for (const [key, value] of Object.entries(env)) {
        args.push('--env', `${key}=${value}`)
      }
      
      args.push(name)
      
      if (options.url) {
        args.push(options.url)
      }
      
      try {
        await execClaudeCLI(args)
        spinner.succeed(`Successfully configured ${name} in Claude Code`)
      } catch (error) {
        spinner.warn(`Could not configure in Claude Code automatically`)
        logger.info('Please restart Claude Code to apply changes')
      }
    } else {
      spinner.succeed(`Server configuration saved`)
      logger.info('\nClaude CLI not found. Please install it to configure servers automatically:')
      logger.info('npm install -g @anthropic/claude-cli')
    }
    
    logger.info(`\nRemote MCP server configured with ${options.scope} scope`)
    
    // Add to .mcp.json if appropriate for team sharing
    if (shouldAddToMCPJson(serverConfig)) {
      const mcpJsonConfig = convertToMCPJsonFormat(name, serverConfig)
      
      await addServerToMCPJson(
        { name, verification: { status: 'community' } } as any,
        JSON.stringify(mcpJsonConfig),
        []
      )
    }
  } catch (error) {
    spinner.fail(`Failed to add remote MCP server`)
    throw error
  }
}

async function interactiveAddMCP(
  configManager: ConfigManager, 
  registryClient: RegistryClient
): Promise<void> {
  // Check if Docker MCP is available
  const dockerStatus = await checkDockerMCPStatus()
  const dockerAvailable = dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable
  
  if (dockerAvailable) {
    // Ask user which provider to use
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select MCP provider:',
        choices: [
          { name: 'Docker MCP (containerized local servers)', value: 'docker' },
          { name: 'Claude CLI (remote servers via SSE/HTTP)', value: 'claude' }
        ]
      }
    ])
    
    if (provider === 'docker') {
      await interactiveAddDockerMCP(configManager)
      return
    } else if (provider === 'claude') {
      await interactiveAddRemoteMCP(configManager)
      return
    }
  }
  
  // Original interactive MCP add logic (fallback for non-Docker)
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

// Helper functions for Docker MCP integration
async function interactiveAddRemoteMCP(configManager: ConfigManager): Promise<void> {
  logger.heading('Add Remote MCP Server')
  
  // Collect server details
  const { name, transport } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Server name:',
      validate: (input) => input.trim() ? true : 'Server name is required'
    },
    {
      type: 'list',
      name: 'transport',
      message: 'Transport type:',
      choices: [
        { name: 'SSE (Server-Sent Events)', value: 'sse' },
        { name: 'HTTP (REST API)', value: 'http' },
        { name: 'STDIO (Standard I/O)', value: 'stdio' }
      ]
    }
  ])
  
  let url: string | undefined
  let headers: string[] = []
  
  // Get URL for SSE/HTTP transports
  if (transport === 'sse' || transport === 'http') {
    const { serverUrl, hasHeaders } = await inquirer.prompt([
      {
        type: 'input',
        name: 'serverUrl',
        message: 'Server URL:',
        validate: (input) => {
          if (!input.trim()) return 'URL is required for ' + transport
          try {
            new URL(input)
            return true
          } catch {
            return 'Please enter a valid URL'
          }
        }
      },
      {
        type: 'confirm',
        name: 'hasHeaders',
        message: 'Do you need to add authentication headers?',
        default: false
      }
    ])
    
    url = serverUrl
    
    // Collect headers
    if (hasHeaders) {
      let addMore = true
      while (addMore) {
        const { header, more } = await inquirer.prompt([
          {
            type: 'input',
            name: 'header',
            message: 'Enter header (e.g., "Authorization: Bearer token"):',
            validate: (input) => input.includes(':') ? true : 'Header must be in format "Key: Value"'
          },
          {
            type: 'confirm',
            name: 'more',
            message: 'Add another header?',
            default: false
          }
        ])
        headers.push(header)
        addMore = more
      }
    }
  }
  
  // Get scope
  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: 'Configuration scope:',
      choices: [
        { name: 'Local (this project only)', value: 'local' },
        { name: 'User (across all projects)', value: 'user' },
        { name: 'Project (shared with team)', value: 'project' }
      ],
      default: 'local'
    }
  ])
  
  // Environment variables
  const { hasEnvVars } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasEnvVars',
      message: 'Do you need to set environment variables?',
      default: false
    }
  ])
  
  let envVars: string[] = []
  if (hasEnvVars) {
    const { envInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'envInput',
        message: 'Enter environment variables (e.g., API_KEY=value SECRET=value):',
        validate: (input) => input.trim() ? true : 'Please enter at least one environment variable'
      }
    ])
    envVars = envInput.split(' ').filter((e: string) => e.includes('='))
  }
  
  // Add the remote server
  await addRemoteMCPServer(name, configManager, {
    scope,
    transport,
    url,
    headers,
    envVars
  })
}

async function setupDockerMCPGatewayCommand(scope: string): Promise<void> {
  logger.heading('Setting up Docker MCP Gateway')
  
  try {
    await setupDockerMCPGateway(scope as 'local' | 'project' | 'user')
    
    logger.success('\n✅ Docker MCP gateway configured!')
    logger.info('\nNext steps:')
    logger.info('1. Restart Claude Code to activate the gateway')
    logger.info('2. Run "bwc add --mcp <server-name>" to add servers')
    logger.info('3. Or run "bwc add" for interactive mode')
  } catch (error: any) {
    logger.error(`Failed to setup gateway: ${error.message}`)
  }
}

async function shouldUseDockerMCP(): Promise<boolean> {
  // Check if Docker MCP is available and preferred
  const status = await checkDockerMCPStatus()
  return status.dockerInstalled && status.mcpToolkitAvailable
}

async function addDockerMCPServer(name: string, configManager: ConfigManager, scope: string = 'local'): Promise<void> {
  const spinner = logger.spinner(`Adding Docker MCP server: ${name}`)
  
  try {
    // Check if server exists in catalog
    const info = await getDockerMCPServerInfo(name)
    
    if (!info) {
      spinner.fail(`Server "${name}" not found in Docker MCP catalog`)
      logger.info('Run "bwc list --mcps" to see available servers')
      return
    }
    
    spinner.stop()
    logger.info(`\n📦 ${name}`)
    logger.info(`   ${info}`)
    
    // Check if already installed
    const installed = await listInstalledDockerMCPServers()
    if (installed.includes(name)) {
      // Check if it's already in BWC config
      const trackedServers = await configManager.getInstalledMCPServers()
      if (trackedServers.includes(name)) {
        logger.warn(`Server "${name}" is already installed and tracked in BWC config`)
        return
      }
      
      // Server is installed but not tracked in BWC config
      logger.warn(`Server "${name}" is already installed in Docker MCP`)
      
      const { shouldTrack } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldTrack',
          message: 'Would you like to add it to your BWC config file for tracking?',
          default: true
        }
      ])
      
      if (shouldTrack) {
        // Create the full MCP server configuration to store
        const serverConfig: MCPServerConfig = {
          provider: 'docker',
          transport: 'stdio',
          scope: scope as 'local' | 'user' | 'project',
          installedAt: new Date().toISOString(),
          registryName: name
        }
        await configManager.addInstalledMCPServer(name, serverConfig)
        spinner.succeed(`Server "${name}" added to BWC config for tracking`)
      } else {
        logger.info('Server not added to BWC config')
      }
      return
    }
    
    // Enable the server
    spinner.start(`Enabling ${name} in Docker MCP Toolkit...`)
    await enableDockerMCPServer(name)
    
    // Create the full MCP server configuration to store
    const serverConfig: MCPServerConfig = {
      provider: 'docker',
      transport: 'stdio',
      scope: scope as 'local' | 'user' | 'project',
      installedAt: new Date().toISOString(),
      registryName: name
    }
    
    // Update BWC config to track it with full configuration
    await configManager.addInstalledMCPServer(name, serverConfig)
    
    spinner.succeed(`Server "${name}" added successfully!`)
    
    logger.info('\n✅ The server is now available through the Docker MCP gateway')
    logger.info('   Try using it in Claude Code!')
    
  } catch (error: any) {
    spinner.fail(`Failed to add server "${name}"`)
    logger.error(error.message)
  }
}

async function interactiveAddDockerMCP(configManager: ConfigManager): Promise<void> {
  logger.heading('Add Docker MCP Servers')
  
  const spinner = logger.spinner('Fetching available servers...')
  
  try {
    const available = await listAvailableDockerMCPServers()
    const installed = await listInstalledDockerMCPServers()
    
    spinner.stop()
    
    if (available.length === 0) {
      logger.warn('No servers available in Docker MCP catalog')
      return
    }
    
    // Filter out already installed servers
    const notInstalled = available.filter(s => !installed.includes(s))
    
    if (notInstalled.length === 0) {
      logger.info('All available servers are already installed!')
      logger.info(`Installed servers: ${installed.join(', ')}`)
      return
    }
    
    logger.info(`Found ${available.length} servers (${installed.length} installed)`)
    logger.info('Use SPACE to select, ENTER to confirm')
    
    const { selected } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: 'Select servers to install:',
      choices: notInstalled.map(name => ({
        name: name,
        value: name,
        checked: false
      })),
      pageSize: 15,
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must select at least one server!'
        }
        return true
      }
    }])
    
    if (!selected || selected.length === 0) {
      logger.warn('No servers selected')
      return
    }
    
    logger.info(`\nInstalling ${selected.length} server(s)...`)
    
    for (const name of selected) {
      await addDockerMCPServer(name, configManager)
    }
    
    logger.success('\n🎉 All selected servers have been added!')
    logger.info('They are now available through the Docker MCP gateway in Claude Code')
    
  } catch (error: any) {
    spinner.fail('Failed to fetch servers')
    logger.error(error.message)
  }
}