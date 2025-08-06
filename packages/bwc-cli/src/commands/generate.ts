import { Command } from 'commander'
import inquirer from 'inquirer'
import path from 'path'
import { writeFile, ensureDir, fileExists } from '../utils/files.js'
import { logger } from '../utils/logger.js'
import { RegistryManager } from '../utils/registry-fetcher.js'
import { MCPServer, UserInput } from '../registry/types.js'
import chalk from 'chalk'

export function createGenerateCommand() {
  return new Command('generate')
    .description('Generate MCP server definitions from registries')
    .option('-r, --registry <registry>', 'fetch from specific registry (github, smithery, docker, all)')
    .option('-m, --manual', 'manually create a new MCP server definition')
    .option('-o, --output <path>', 'output directory for generated markdown files', './mcp-servers/generated')
    .option('--api-key <key>', 'API key for Smithery registry')
    .option('--dry-run', 'preview without writing files')
    .action(async (options) => {
      try {
        if (options.manual) {
          await interactiveCreateMCPServer(options)
        } else {
          await fetchAndGenerateServers(options)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })
}

async function fetchAndGenerateServers(options: any): Promise<void> {
  const registryManager = new RegistryManager({
    smitheryApiKey: options.apiKey
  })
  
  let servers: MCPServer[] = []
  
  if (!options.registry || options.registry === 'all') {
    servers = await registryManager.fetchFromAllRegistries()
  } else {
    const validRegistries = ['github', 'smithery', 'docker']
    if (!validRegistries.includes(options.registry)) {
      throw new Error(`Invalid registry: ${options.registry}. Must be one of: ${validRegistries.join(', ')}, all`)
    }
    
    servers = await registryManager.fetchFromRegistry(
      options.registry as 'github' | 'smithery' | 'docker',
      { apiKey: options.apiKey }
    )
  }
  
  if (servers.length === 0) {
    logger.warn('No servers found from the specified registry')
    return
  }
  
  logger.info(`Found ${servers.length} MCP servers`)
  
  // Allow user to select which servers to generate
  const { selectedServers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedServers',
      message: 'Select MCP servers to generate:',
      choices: servers.map(s => ({
        name: `${s.name} - ${s.description} (${s.source_registry?.type})`,
        value: s,
        checked: true
      })),
      validate: (answer: MCPServer[]) => {
        if (answer.length < 1) {
          return 'You must select at least one server!'
        }
        return true
      }
    }
  ])
  
  if (selectedServers.length === 0) {
    logger.warn('No servers selected')
    return
  }
  
  // Ask if user wants to detect and add user inputs
  const { detectInputs } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'detectInputs',
      message: 'Automatically detect user input requirements from configurations?',
      default: true
    }
  ])
  
  // Process each selected server
  for (const server of selectedServers) {
    logger.info(`\nProcessing ${server.name}...`)
    
    // Detect user inputs if requested
    if (detectInputs && !server.user_inputs) {
      const detectedInputs = await registryManager.detectUserInputs(server)
      if (detectedInputs.length > 0) {
        logger.info(`Detected ${detectedInputs.length} user input(s)`)
        
        // Allow user to review and edit detected inputs
        const { confirmInputs } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmInputs',
            message: `Review detected inputs for ${server.name}?`,
            default: true
          }
        ])
        
        if (confirmInputs) {
          server.user_inputs = await reviewUserInputs(detectedInputs)
        } else {
          server.user_inputs = detectedInputs
        }
      }
    }
    
    // Generate markdown
    const markdown = await registryManager.generateMarkdown(server)
    
    if (options.dryRun) {
      logger.info(chalk.gray('--- DRY RUN: Would write to ' + server.file + ' ---'))
      console.log(markdown)
      logger.info(chalk.gray('--- END DRY RUN ---'))
    } else {
      // Ensure output directory exists
      const outputPath = path.join(options.output, server.file)
      await ensureDir(path.dirname(outputPath))
      
      // Check if file already exists
      if (await fileExists(outputPath)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `File ${outputPath} already exists. Overwrite?`,
            default: false
          }
        ])
        
        if (!overwrite) {
          logger.info(`Skipping ${server.name}`)
          continue
        }
      }
      
      // Write the file
      await writeFile(outputPath, markdown)
      logger.success(`Generated ${outputPath}`)
    }
  }
  
  logger.info(`\nGeneration complete! ${selectedServers.length} server(s) processed.`)
  
  if (!options.dryRun) {
    logger.info('\nNext steps:')
    logger.info('1. Review the generated markdown files')
    logger.info('2. Add any missing documentation')
    logger.info('3. Test the configurations')
    logger.info('4. Consider contributing back with: bwc contribute')
  }
}

async function interactiveCreateMCPServer(options: any): Promise<void> {
  logger.info('Create a new MCP server definition interactively\n')
  
  // Basic information
  const basicInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Server name (lowercase, hyphens):',
      validate: (input: string) => {
        if (!input) return 'Name is required'
        if (!/^[a-z0-9-]+$/.test(input)) return 'Name must be lowercase with hyphens only'
        return true
      }
    },
    {
      type: 'input',
      name: 'display_name',
      message: 'Display name:',
      validate: (input: string) => input ? true : 'Display name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input: string) => input ? true : 'Description is required'
    },
    {
      type: 'list',
      name: 'category',
      message: 'Category:',
      choices: [
        'databases',
        'file-systems',
        'apis',
        'monitoring',
        'development',
        'ai-tools',
        'productivity',
        'web'
      ]
    },
    {
      type: 'list',
      name: 'server_type',
      message: 'Server type:',
      choices: ['stdio', 'streaming-http', 'websocket'],
      default: 'stdio'
    }
  ])
  
  // Security settings
  const security = await inquirer.prompt([
    {
      type: 'list',
      name: 'auth_type',
      message: 'Authentication type:',
      choices: ['none', 'oauth2', 'oauth2.1', 'api-key'],
      default: 'none'
    },
    {
      type: 'input',
      name: 'permissions',
      message: 'Permissions (comma-separated, e.g., read, write):',
      filter: (input: string) => input.split(',').map(p => p.trim()).filter(p => p)
    }
  ])
  
  // Installation methods
  const { hasDocker } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasDocker',
      message: 'Is this server available as a Docker image?',
      default: false
    }
  ])
  
  const { hasNpm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasNpm',
      message: 'Is this server available as an npm package?',
      default: false
    }
  ])
  
  const installationMethods = []
  
  if (hasDocker) {
    const dockerInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'docker_image',
        message: 'Docker image name:',
        validate: (input: string) => input ? true : 'Docker image is required'
      }
    ])
    
    installationMethods.push({
      type: 'docker' as const,
      recommended: true,
      command: `docker pull ${dockerInfo.docker_image}`,
      config_example: JSON.stringify({
        mcpServers: {
          [basicInfo.name]: {
            command: 'docker',
            args: ['run', '-i', '--rm', dockerInfo.docker_image],
            env: {}
          }
        }
      }, null, 2)
    })
  }
  
  if (hasNpm) {
    const npmInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'npm_package',
        message: 'npm package name:',
        validate: (input: string) => input ? true : 'npm package is required'
      }
    ])
    
    installationMethods.push({
      type: 'npm' as const,
      recommended: !hasDocker,
      command: `npm install -g ${npmInfo.npm_package}`,
      config_example: JSON.stringify({
        mcpServers: {
          [basicInfo.name]: {
            command: 'npx',
            args: ['-y', npmInfo.npm_package],
            env: {}
          }
        }
      }, null, 2)
    })
  }
  
  // User inputs
  const { hasUserInputs } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasUserInputs',
      message: 'Does this server require user configuration (API keys, paths, etc.)?',
      default: false
    }
  ])
  
  let userInputs: UserInput[] = []
  if (hasUserInputs) {
    userInputs = await collectUserInputs()
  }
  
  // Create the MCP server object
  const server: MCPServer = {
    name: basicInfo.name,
    display_name: basicInfo.display_name,
    description: basicInfo.description,
    category: basicInfo.category,
    server_type: basicInfo.server_type,
    protocol_version: '1.0.0',
    security: {
      auth_type: security.auth_type,
      permissions: security.permissions
    },
    sources: {
      ...(hasDocker && { docker: installationMethods.find(m => m.type === 'docker')?.command?.split(' ').pop() }),
      ...(hasNpm && { npm: installationMethods.find(m => m.type === 'npm')?.command?.split(' ').pop() })
    },
    verification: {
      status: 'community',
      last_tested: new Date().toISOString().split('T')[0],
      tested_with: ['claude-3.5']
    },
    installation_methods: installationMethods,
    user_inputs: userInputs.length > 0 ? userInputs : undefined,
    tags: [],
    file: `mcp-servers/manual/${basicInfo.name}.md`,
    path: `mcp-servers/manual/${basicInfo.name}.md`,
    source_registry: {
      type: 'manual',
      last_fetched: new Date().toISOString(),
      auto_update: false
    }
  }
  
  // Generate and save
  const registryManager = new RegistryManager()
  const markdown = await registryManager.generateMarkdown(server)
  
  // Preview
  logger.info('\n' + chalk.bold('Preview:'))
  console.log(chalk.gray('---'))
  console.log(markdown)
  console.log(chalk.gray('---'))
  
  const { save } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'save',
      message: 'Save this MCP server definition?',
      default: true
    }
  ])
  
  if (save) {
    const outputPath = path.join(options.output || './mcp-servers/generated', server.file)
    await ensureDir(path.dirname(outputPath))
    await writeFile(outputPath, markdown)
    logger.success(`Saved to ${outputPath}`)
    
    logger.info('\nNext steps:')
    logger.info('1. Review and enhance the generated markdown')
    logger.info('2. Add detailed documentation')
    logger.info('3. Test the configuration')
    logger.info('4. Consider contributing: bwc contribute -f ' + outputPath)
  }
}

async function collectUserInputs(): Promise<UserInput[]> {
  const inputs: UserInput[] = []
  let addMore = true
  
  while (addMore) {
    const input = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Input name (e.g., api_key, directory_path):',
        validate: (input: string) => {
          if (!input) return 'Name is required'
          if (!/^[a-z_]+$/.test(input)) return 'Name must be lowercase with underscores'
          return true
        }
      },
      {
        type: 'input',
        name: 'display_name',
        message: 'Display name:',
        validate: (input: string) => input ? true : 'Display name is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Input type:',
        choices: ['string', 'path', 'url', 'number', 'boolean', 'select', 'password']
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        validate: (input: string) => input ? true : 'Description is required'
      },
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this input required?',
        default: true
      },
      {
        type: 'input',
        name: 'placeholder',
        message: 'Placeholder value (optional):'
      },
      {
        type: 'list',
        name: 'target',
        message: 'Where is this used?',
        choices: [
          { name: 'Environment variable', value: 'env' },
          { name: 'Command argument', value: 'arg' },
          { name: 'Both', value: 'both' }
        ]
      }
    ])
    
    const userInput: UserInput = {
      name: input.name,
      display_name: input.display_name,
      type: input.type,
      description: input.description,
      required: input.required,
      placeholder: input.placeholder || undefined
    }
    
    // Add target-specific fields
    if (input.target === 'env' || input.target === 'both') {
      const { envVar } = await inquirer.prompt([
        {
          type: 'input',
          name: 'envVar',
          message: 'Environment variable name:',
          default: input.name.toUpperCase()
        }
      ])
      userInput.env_var = envVar
    }
    
    if (input.target === 'arg' || input.target === 'both') {
      const { argPosition } = await inquirer.prompt([
        {
          type: 'number',
          name: 'argPosition',
          message: 'Argument position in args array:',
          validate: (input: number) => input >= 0 ? true : 'Position must be 0 or greater'
        }
      ])
      userInput.arg_position = argPosition
    }
    
    // Type-specific validation
    if (input.type === 'path') {
      const { pathValidation } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'pathValidation',
          message: 'Path validation:',
          choices: [
            { name: 'Must exist', value: 'exists' },
            { name: 'Must be directory', value: 'is_directory' },
            { name: 'Must be file', value: 'is_file' }
          ]
        }
      ])
      
      if (pathValidation.length > 0) {
        userInput.validation = {}
        if (pathValidation.includes('exists')) userInput.validation.exists = true
        if (pathValidation.includes('is_directory')) userInput.validation.is_directory = true
        if (pathValidation.includes('is_file')) userInput.validation.is_file = true
      }
    }
    
    inputs.push(userInput)
    
    const { more } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'more',
        message: 'Add another input?',
        default: false
      }
    ])
    
    addMore = more
  }
  
  return inputs
}

async function reviewUserInputs(inputs: UserInput[]): Promise<UserInput[]> {
  logger.info('\nDetected user inputs:')
  inputs.forEach((input, index) => {
    console.log(`\n${index + 1}. ${input.display_name} (${input.name})`)
    console.log(`   Type: ${input.type}`)
    console.log(`   Description: ${input.description}`)
    if (input.placeholder) console.log(`   Placeholder: ${input.placeholder}`)
  })
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Keep all detected inputs', value: 'keep' },
        { name: 'Edit inputs', value: 'edit' },
        { name: 'Discard all inputs', value: 'discard' }
      ]
    }
  ])
  
  if (action === 'keep') {
    return inputs
  } else if (action === 'discard') {
    return []
  }
  
  // Edit mode
  const editedInputs: UserInput[] = []
  
  for (const input of inputs) {
    const { keep } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'keep',
        message: `Keep input "${input.display_name}"?`,
        default: true
      }
    ])
    
    if (keep) {
      // Allow editing
      const edited = await inquirer.prompt([
        {
          type: 'input',
          name: 'display_name',
          message: 'Display name:',
          default: input.display_name
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          default: input.description
        },
        {
          type: 'confirm',
          name: 'required',
          message: 'Required?',
          default: input.required
        }
      ])
      
      editedInputs.push({
        ...input,
        ...edited
      })
    }
  }
  
  return editedInputs
}