import { Command } from 'commander'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { MCPServerConfig } from '../registry/types.js'
import { logger } from '../utils/logger.js'
import { writeFile } from '../utils/files.js'
import { installMCPServer, configureInClaudeCode } from '../utils/mcp-installer.js'
import { checkDockerMCPStatus, enableDockerMCPServer, setupDockerMCPGateway } from '../utils/docker-mcp.js'
import { execClaudeCLI, isClaudeCLIAvailable } from '../utils/claude-cli.js'
import { addServerToMCPJson } from '../utils/mcp-json.js'

export function createInstallCommand() {
  const install = new Command('install')
    .description('Install all subagents, commands, and MCP servers from configuration')
    .action(async () => {
      try {
        const configManager = ConfigManager.getInstance()
        const registryClient = new RegistryClient(configManager)
        
        // Check if using project config
        const isProject = await configManager.isUsingProjectConfig()
        const configLocation = await configManager.getConfigLocation()
        
        logger.info(`Installing from: ${configLocation}`)
        
        // Get all dependencies
        const { subagents, commands, mcpServers } = await configManager.getAllDependencies()
        
        if (subagents.length === 0 && commands.length === 0 && mcpServers.length === 0) {
          logger.info('No dependencies to install.')
          return
        }
        
        logger.heading(`Installing ${subagents.length} subagents, ${commands.length} commands, and ${mcpServers.length} MCP servers`)
        
        // Install subagents
        if (subagents.length > 0) {
          const subagentsPath = await configManager.getSubagentsPath()
          logger.info(`Installing subagents to: ${subagentsPath}`)
          
          for (const name of subagents) {
            const spinner = logger.spinner(`Installing subagent: ${name}`)
            
            try {
              const subagent = await registryClient.findSubagent(name)
              
              if (!subagent) {
                spinner.fail(`Subagent "${name}" not found in registry`)
                continue
              }
              
              const content = await registryClient.fetchFileContent(subagent.file)
              const filePath = path.join(subagentsPath, `${subagent.name}.md`)
              
              await writeFile(filePath, content)
              spinner.succeed(`Installed subagent: ${name}`)
            } catch (error) {
              spinner.fail(`Failed to install subagent: ${name}`)
              logger.error((error as Error).message)
            }
          }
        }
        
        // Install commands
        if (commands.length > 0) {
          const commandsPath = await configManager.getCommandsPath()
          logger.info(`Installing commands to: ${commandsPath}`)
          
          for (const name of commands) {
            const spinner = logger.spinner(`Installing command: ${name}`)
            
            try {
              const command = await registryClient.findCommand(name)
              
              if (!command) {
                spinner.fail(`Command "${name}" not found in registry`)
                continue
              }
              
              const content = await registryClient.fetchFileContent(command.file)
              const filePath = path.join(commandsPath, `${command.name}.md`)
              
              await writeFile(filePath, content)
              spinner.succeed(`Installed command: ${command.prefix}${name}`)
            } catch (error) {
              spinner.fail(`Failed to install command: ${name}`)
              logger.error((error as Error).message)
            }
          }
        }
        
        // Install MCP servers
        if (mcpServers.length > 0) {
          logger.info(`Installing MCP servers...`)
          
          // Get the full MCP server configurations
          const serverConfigs = await configManager.getAllMCPServerConfigs()
          
          // Check if Claude CLI is available
          const hasClaudeCLI = await isClaudeCLIAvailable()
          
          for (const serverName of mcpServers) {
            const spinner = logger.spinner(`Installing MCP server: ${serverName}`)
            
            try {
              // Get the stored configuration for this server
              const serverConfig = serverConfigs[serverName]
              
              if (!serverConfig) {
                // Fallback: Try to fetch from registry if no stored config
                spinner.text = `No stored config for ${serverName}, fetching from registry...`
                
                const server = await registryClient.findMCPServer(serverName)
                if (!server) {
                  spinner.fail(`MCP server "${serverName}" not found`)
                  continue
                }
                
                // Use default installation method
                let method = server.installation_methods.find(m => m.type === 'claude-cli' && m.recommended)
                if (!method) {
                  method = server.installation_methods.find(m => m.recommended) || server.installation_methods[0]
                }
                
                if (!method) {
                  spinner.fail(`No installation methods available for ${serverName}`)
                  continue
                }
                
                await installMCPServer(server, method)
                await configureInClaudeCode(server, method, { scope: 'local', envVars: [] })
                spinner.succeed(`Installed MCP server: ${serverName}`)
                continue
              }
              
              // Use the stored configuration
              spinner.text = `Installing ${serverName} with stored configuration...`
              
              if (serverConfig.provider === 'docker') {
                // Docker MCP server
                const dockerStatus = await checkDockerMCPStatus()
                if (dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable) {
                  // Ensure gateway is set up
                  try {
                    await setupDockerMCPGateway(serverConfig.scope)
                  } catch (error) {
                    logger.warn('Could not setup Docker MCP gateway automatically')
                  }
                  
                  // Enable the server
                  await enableDockerMCPServer(serverName)
                  spinner.succeed(`Enabled Docker MCP server: ${serverName}`)
                } else {
                  spinner.warn(`Docker MCP not available, skipping ${serverName}`)
                }
              } else if (serverConfig.provider === 'claude') {
                // Claude MCP server
                if (!hasClaudeCLI) {
                  spinner.warn('Claude CLI not installed, showing manual configuration')
                  logger.info('\nManual configuration required for ' + serverName)
                  showStoredConfiguration(serverName, serverConfig)
                  continue
                }
                
                // Build Claude CLI command from stored config
                const args = ['mcp', 'add']
                args.push('--scope', serverConfig.scope)
                
                // Handle different transport types
                if (serverConfig.transport === 'sse' || serverConfig.transport === 'http') {
                  args.push('--transport', serverConfig.transport)
                  
                  // Add headers if present
                  if (serverConfig.headers) {
                    for (const [key, value] of Object.entries(serverConfig.headers)) {
                      args.push('--header', `${key}: ${value}`)
                    }
                  }
                  
                  // Add the server name and URL
                  args.push(serverName)
                  if (serverConfig.url) {
                    args.push(serverConfig.url)
                  }
                } else if (serverConfig.transport === 'stdio') {
                  // Add environment variables
                  if (serverConfig.env) {
                    for (const [key, value] of Object.entries(serverConfig.env)) {
                      args.push('--env', `${key}=${value}`)
                    }
                  }
                  
                  // Add the server name and command
                  args.push(serverName)
                  if (serverConfig.command) {
                    args.push('--', serverConfig.command)
                    if (serverConfig.args) {
                      args.push(...serverConfig.args)
                    }
                  }
                }
                
                // Execute Claude CLI command
                logger.info(`Running: claude ${args.join(' ')}`)
                await execClaudeCLI(args)
                
                // Update .mcp.json if project scope
                if (serverConfig.scope === 'project') {
                  await updateMCPJsonFromConfig(serverName, serverConfig)
                }
                
                spinner.succeed(`Configured MCP server: ${serverName} (${serverConfig.scope} scope)`)
              }
            } catch (error) {
              spinner.fail(`Failed to install MCP server: ${serverName}`)
              logger.error((error as Error).message)
            }
          }
          
          logger.info('\n✓ MCP servers installation complete')
          logger.info('Restart Claude Code to activate any changes')
        }
        
        logger.success('Installation complete!')
        
        if (isProject) {
          logger.info('Dependencies installed to project.')
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return install
}

// Helper function to show stored configuration
function showStoredConfiguration(serverName: string, config: MCPServerConfig): void {
  logger.info(`\nStored configuration for ${serverName}:`)
  logger.info(`  Provider: ${config.provider}`)
  logger.info(`  Transport: ${config.transport}`)
  logger.info(`  Scope: ${config.scope}`)
  
  if (config.transport === 'stdio') {
    if (config.command) {
      logger.info(`  Command: ${config.command}`)
    }
    if (config.args) {
      logger.info(`  Args: ${config.args.join(' ')}`)
    }
    if (config.env) {
      logger.info(`  Environment variables:`)
      for (const [key, value] of Object.entries(config.env)) {
        logger.info(`    ${key}=${value}`)
      }
    }
  } else if (config.transport === 'sse' || config.transport === 'http') {
    if (config.url) {
      logger.info(`  URL: ${config.url}`)
    }
    if (config.headers) {
      logger.info(`  Headers:`)
      for (const [key, value] of Object.entries(config.headers)) {
        logger.info(`    ${key}: ${value}`)
      }
    }
  }
}

// Helper function to update .mcp.json from stored config
async function updateMCPJsonFromConfig(serverName: string, config: MCPServerConfig): Promise<void> {
  const mcpJsonConfig: any = {
    mcpServers: {
      [serverName]: {}
    }
  }
  
  const serverEntry = mcpJsonConfig.mcpServers[serverName]
  
  if (config.transport === 'stdio') {
    if (config.command) serverEntry.command = config.command
    if (config.args) serverEntry.args = config.args
    if (config.env) serverEntry.env = config.env
  } else if (config.transport === 'sse' || config.transport === 'http') {
    serverEntry.transport = config.transport
    if (config.url) serverEntry.url = config.url
    if (config.headers) serverEntry.headers = config.headers
  }
  
  // Use the addServerToMCPJson function to properly update the file
  await addServerToMCPJson(
    { name: serverName, verification: { status: config.verificationStatus || 'community' } } as any,
    JSON.stringify(mcpJsonConfig),
    []
  )
}