import { Command } from 'commander'
import inquirer from 'inquirer'
import path from 'path'
import { ConfigManager } from '../config/manager.js'
import { RegistryClient } from '../registry/client.js'
import { logger } from '../utils/logger.js'
import { writeFile } from '../utils/files.js'
import { Subagent, Command as CliCommand } from '../registry/types.js'

export function createAddCommand() {
  const add = new Command('add')
    .description('Add subagents or commands')
    .option('-a, --agent <name>', 'add a specific subagent')
    .option('-c, --command <name>', 'add a specific command')
    .option('-g, --global', 'force global installation')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager()
        const registryClient = new RegistryClient(configManager)

        // Check if using project config
        const isProject = await configManager.isUsingProjectConfig()
        const scope = isProject && !options.global ? 'project' : 'global'
        
        if (isProject && !options.global) {
          logger.info('Installing to project configuration')
        }

        if (options.agent) {
          await addSubagent(options.agent, configManager, registryClient)
        } else if (options.command) {
          await addCommand(options.command, configManager, registryClient)
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
          { name: 'Command', value: 'command' }
        ]
      }
    ])

    if (type === 'subagent') {
      await interactiveAddSubagent(configManager, registryClient)
    } else {
      await interactiveAddCommand(configManager, registryClient)
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