import { Command } from 'commander'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { writeFile } from '../utils/files.js'
import { installMCPServer, configureInClaudeCode } from '../utils/mcp-installer.js'
import { checkDockerMCPStatus, enableDockerMCPServer, setupDockerMCPGateway } from '../utils/docker-mcp.js'

export function createInstallCommand() {
  const install = new Command('install')
    .description('Install all subagents, commands, and MCP servers from configuration')
    .action(async () => {
      try {
        const configManager = new ConfigManager()
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
          
          // Check if Docker MCP is available
          const dockerStatus = await checkDockerMCPStatus()
          const useDockerMCP = dockerStatus.dockerInstalled && dockerStatus.mcpToolkitAvailable
          
          if (useDockerMCP) {
            logger.info('Using Docker MCP Toolkit for server installation')
            
            // Ensure Docker MCP gateway is set up in Claude Code
            let gatewaySetup = false
            try {
              await setupDockerMCPGateway('local')
              gatewaySetup = true
            } catch (error) {
              logger.warn('Could not setup Docker MCP gateway automatically')
              logger.info('You may need to manually add the Docker MCP gateway to Claude Code')
            }
            
            // Enable each server in Docker MCP
            for (const name of mcpServers) {
              const spinner = logger.spinner(`Enabling Docker MCP server: ${name}`)
              
              try {
                await enableDockerMCPServer(name)
                spinner.succeed(`Enabled MCP server: ${name}`)
                
                // Track in BWC config
                await configManager.addInstalledMCPServer(name)
              } catch (error) {
                spinner.fail(`Failed to enable MCP server: ${name}`)
                logger.error((error as Error).message)
              }
            }
            
            if (gatewaySetup) {
              logger.info('\n✓ MCP servers are now available through Docker MCP gateway')
              logger.info('Restart Claude Code to activate the changes')
            }
          } else {
            // Fallback to standard installation method
            for (const name of mcpServers) {
              const spinner = logger.spinner(`Installing MCP server: ${name}`)
              
              try {
                const server = await registryClient.findMCPServer(name)
                
                if (!server) {
                  spinner.fail(`MCP server "${name}" not found in registry`)
                  continue
                }
                
                spinner.text = `Installing ${name}...`
                
                // Select installation method - prefer claude-cli method
                let method = server.installation_methods.find(m => m.type === 'claude-cli' && m.recommended)
                if (!method) {
                  // Fall back to other methods
                  method = server.installation_methods.find(m => m.recommended) || server.installation_methods[0]
                }
                
                if (!method) {
                  spinner.fail(`No installation methods available for ${name}`)
                  continue
                }
                
                // Install the MCP server
                await installMCPServer(server, method)
                
                // Configure in Claude Code with local scope (since this is from config file)
                await configureInClaudeCode(server, method, { scope: 'local', envVars: [] })
                
                spinner.succeed(`Installed MCP server: ${name}`)
              } catch (error) {
                spinner.fail(`Failed to install MCP server: ${name}`)
                logger.error((error as Error).message)
              }
            }
          }
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