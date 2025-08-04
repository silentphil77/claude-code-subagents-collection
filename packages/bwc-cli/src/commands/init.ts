import { Command } from 'commander'
import { ConfigManager } from '../config/manager.js'
import { logger } from '../utils/logger.js'
// No longer need fileExists and CONFIG_PATH imports here

export function createInitCommand() {
  const init = new Command('init')
    .description('Initialize bwc configuration')
    .option('-f, --force', 'overwrite existing configuration')
    .option('-p, --project', 'create project-level configuration')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager()
        
        const isProject = options.project
        const configType = isProject ? 'project' : 'global'
        const spinner = logger.spinner(`Initializing ${configType} bwc configuration...`)
        
        try {
          await configManager.init({ project: isProject, force: options.force })
          spinner.succeed(`${configType} configuration initialized successfully!`)
          
          const configLocation = await configManager.getConfigLocation()
          logger.info(`Configuration saved to: ${configLocation}`)
          
          if (isProject) {
            logger.info('Project-level configuration created.')
            logger.info('Subagents and commands will be installed to this project.')
            logger.info('')
            logger.info('Consider adding .claude/ to your .gitignore:')
            logger.code('echo ".claude/" >> .gitignore')
          } else {
            logger.info('You can now use "bwc add" to install subagents and commands.')
          }
        } catch (error) {
          spinner.fail(`Failed to initialize ${configType} configuration`)
          throw error
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return init
}