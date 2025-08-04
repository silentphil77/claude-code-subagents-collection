import { Command } from 'commander'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { writeFile } from '../utils/files.js'

export function createInstallCommand() {
  const install = new Command('install')
    .description('Install all subagents and commands from configuration')
    .action(async () => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)
        
        // Check if using project config
        const isProject = await configManager.isUsingProjectConfig()
        const configLocation = await configManager.getConfigLocation()
        
        logger.info(`Installing from: ${configLocation}`)
        
        // Get all dependencies
        const { subagents, commands } = await configManager.getAllDependencies()
        
        if (subagents.length === 0 && commands.length === 0) {
          logger.info('No dependencies to install.')
          return
        }
        
        logger.heading(`Installing ${subagents.length} subagents and ${commands.length} commands`)
        
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