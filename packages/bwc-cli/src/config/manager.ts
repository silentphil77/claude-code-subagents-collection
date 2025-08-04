import { BwcConfig } from '../registry/types.js'
import { 
  CONFIG_PATH, 
  BWC_DIR, 
  AGENTS_DIR, 
  COMMANDS_DIR,
  ensureDir,
  fileExists,
  readJSON,
  writeJSON,
  expandTilde
} from '../utils/files.js'
import path from 'path'
import process from 'process'

const DEFAULT_CONFIG: BwcConfig = {
  version: '1.0',
  registry: 'https://buildwithclaude.com/registry.json',
  paths: {
    subagents: AGENTS_DIR,
    commands: COMMANDS_DIR
  },
  installed: {
    subagents: [],
    commands: []
  }
}

const DEFAULT_PROJECT_CONFIG: BwcConfig = {
  version: '1.0',
  registry: 'https://buildwithclaude.com/registry.json',
  paths: {
    subagents: '.claude/agents/',
    commands: '.claude/commands/'
  },
  installed: {
    subagents: [],
    commands: []
  }
}

export class ConfigManager {
  private config: BwcConfig | null = null
  private configPath: string | null = null
  private isProjectLevel: boolean = false

  private async findProjectConfig(): Promise<string | null> {
    const projectConfigNames = ['bwc.config.json', '.bwc/config.json']
    let currentDir = process.cwd()
    
    while (currentDir !== path.dirname(currentDir)) {
      for (const configName of projectConfigNames) {
        const configPath = path.join(currentDir, configName)
        if (await fileExists(configPath)) {
          return configPath
        }
      }
      currentDir = path.dirname(currentDir)
    }
    
    return null
  }

  async init(options?: { project?: boolean, force?: boolean }): Promise<void> {
    if (options?.project) {
      // Initialize project-level config
      const projectConfigPath = path.join(process.cwd(), 'bwc.config.json')
      
      if (await fileExists(projectConfigPath) && !options.force) {
        throw new Error('Project configuration already exists. Use --force to overwrite.')
      }
      
      await writeJSON(projectConfigPath, DEFAULT_PROJECT_CONFIG)
      this.config = DEFAULT_PROJECT_CONFIG
      this.configPath = projectConfigPath
      this.isProjectLevel = true
    } else {
      // Initialize global config
      await ensureDir(BWC_DIR)
      
      if (await fileExists(CONFIG_PATH) && !options.force) {
        throw new Error('Configuration already exists. Use --force to overwrite.')
      }
      
      await writeJSON(CONFIG_PATH, DEFAULT_CONFIG)
      this.config = DEFAULT_CONFIG
      this.configPath = CONFIG_PATH
      this.isProjectLevel = false
    }
  }

  async load(): Promise<BwcConfig> {
    if (this.config) {
      return this.config
    }

    // First, check for project-level config
    const projectConfigPath = await this.findProjectConfig()
    if (projectConfigPath) {
      this.config = await readJSON<BwcConfig>(projectConfigPath)
      this.configPath = projectConfigPath
      this.isProjectLevel = true
      return this.config
    }

    // Fall back to global config
    if (!await fileExists(CONFIG_PATH)) {
      throw new Error('Configuration not found. Run "bwc init" first.')
    }

    this.config = await readJSON<BwcConfig>(CONFIG_PATH)
    this.configPath = CONFIG_PATH
    this.isProjectLevel = false
    return this.config
  }

  async save(): Promise<void> {
    if (!this.config || !this.configPath) {
      throw new Error('No configuration loaded')
    }
    
    await writeJSON(this.configPath, this.config)
  }

  async getSubagentsPath(): Promise<string> {
    const config = await this.load()
    let subagentsPath = config.paths.subagents
    
    // If project-level config with relative path, resolve relative to config directory
    if (this.isProjectLevel && !path.isAbsolute(subagentsPath)) {
      const configDir = path.dirname(this.configPath!)
      subagentsPath = path.join(configDir, subagentsPath)
    } else {
      subagentsPath = expandTilde(subagentsPath)
    }
    
    await ensureDir(subagentsPath)
    return subagentsPath
  }

  async getCommandsPath(): Promise<string> {
    const config = await this.load()
    let commandsPath = config.paths.commands
    
    // If project-level config with relative path, resolve relative to config directory
    if (this.isProjectLevel && !path.isAbsolute(commandsPath)) {
      const configDir = path.dirname(this.configPath!)
      commandsPath = path.join(configDir, commandsPath)
    } else {
      commandsPath = expandTilde(commandsPath)
    }
    
    await ensureDir(commandsPath)
    return commandsPath
  }

  async addInstalledSubagent(name: string): Promise<void> {
    const config = await this.load()
    if (!config.installed.subagents.includes(name)) {
      config.installed.subagents.push(name)
      await this.save()
    }
  }

  async addInstalledCommand(name: string): Promise<void> {
    const config = await this.load()
    if (!config.installed.commands.includes(name)) {
      config.installed.commands.push(name)
      await this.save()
    }
  }

  async removeInstalledSubagent(name: string): Promise<void> {
    const config = await this.load()
    config.installed.subagents = config.installed.subagents.filter(s => s !== name)
    await this.save()
  }

  async removeInstalledCommand(name: string): Promise<void> {
    const config = await this.load()
    config.installed.commands = config.installed.commands.filter(c => c !== name)
    await this.save()
  }

  async getInstalledSubagents(): Promise<string[]> {
    const config = await this.load()
    return config.installed.subagents
  }

  async getInstalledCommands(): Promise<string[]> {
    const config = await this.load()
    return config.installed.commands
  }

  async getRegistryUrl(): Promise<string> {
    const config = await this.load()
    return config.registry
  }

  async isUsingProjectConfig(): Promise<boolean> {
    await this.load()
    return this.isProjectLevel
  }

  async getConfigLocation(): Promise<string> {
    await this.load()
    return this.configPath || CONFIG_PATH
  }

  async getAllDependencies(): Promise<{ subagents: string[], commands: string[] }> {
    const config = await this.load()
    return {
      subagents: config.installed.subagents || [],
      commands: config.installed.commands || []
    }
  }
}