import { BwcConfig, MCPServerConfig, LegacyBwcConfig } from '../registry/types.js'
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
import os from 'os'

const DEFAULT_CONFIG: BwcConfig = {
  version: '1.0',
  registry: 'https://buildwithclaude.com/registry.json',
  paths: {
    subagents: AGENTS_DIR,
    commands: COMMANDS_DIR
  },
  installed: {
    subagents: [],
    commands: [],
    mcpServers: []
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
    commands: [],
    mcpServers: []
  }
}

export class ConfigManager {
  private static instance: ConfigManager | null = null
  private config: BwcConfig | null = null
  private configPath: string | null = null
  private isProjectLevel: boolean = false
  private forceUser: boolean = false

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

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
      // Re-evaluate paths in case they were changed for testing
      const configPath = process.env.BWC_CONFIG_PATH || path.join(process.env.BWC_TEST_HOME || os.homedir(), '.bwc', 'config.json')
      const bwcDir = path.dirname(configPath)
      
      await ensureDir(bwcDir)
      
      if (await fileExists(configPath) && !options?.force) {
        throw new Error('Configuration already exists. Use --force to overwrite.')
      }
      
      await writeJSON(configPath, DEFAULT_CONFIG)
      this.config = DEFAULT_CONFIG
      this.configPath = configPath
      this.isProjectLevel = false
    }
  }

  async load(): Promise<BwcConfig> {
    if (this.config) {
      return this.config
    }

    // If forceUser is true, skip project config check
    if (!this.forceUser) {
      // First, check for project-level config
      const projectConfigPath = await this.findProjectConfig()
      if (projectConfigPath) {
        const rawConfig = await readJSON<any>(projectConfigPath)
        this.config = await this.migrateConfig(rawConfig)
        this.configPath = projectConfigPath
        this.isProjectLevel = true
        return this.config
      }
    }

    // Fall back to user config (or load it directly if forceUser)
    const configPath = process.env.BWC_CONFIG_PATH || path.join(process.env.BWC_TEST_HOME || os.homedir(), '.bwc', 'config.json')
    
    if (!await fileExists(configPath)) {
      throw new Error('Configuration not found. Run "bwc init" first.')
    }

    const rawConfig = await readJSON<any>(configPath)
    this.config = await this.migrateConfig(rawConfig)
    this.configPath = configPath
    this.isProjectLevel = false
    return this.config
  }

  // Migrate old config format to new format
  private async migrateConfig(config: any): Promise<BwcConfig> {
    // Check if mcpServers is in old format (string array)
    if (config.installed?.mcpServers && Array.isArray(config.installed.mcpServers)) {
      // If all elements are strings, it's the old format
      const isOldFormat = config.installed.mcpServers.every((item: any) => typeof item === 'string')
      
      if (isOldFormat) {
        // Convert string array to Record format with minimal config
        const mcpServersRecord: Record<string, MCPServerConfig> = {}
        for (const serverName of config.installed.mcpServers) {
          mcpServersRecord[serverName] = {
            provider: 'docker', // Default to docker for legacy entries
            transport: 'stdio',
            scope: 'local',
            installedAt: new Date().toISOString()
          }
        }
        config.installed.mcpServers = mcpServersRecord
      }
    }
    
    return config as BwcConfig
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
    
    // First expand tilde if present
    subagentsPath = expandTilde(subagentsPath)
    
    // If project-level config with relative path, resolve relative to config directory
    if (this.isProjectLevel && !path.isAbsolute(subagentsPath)) {
      const configDir = path.dirname(this.configPath!)
      subagentsPath = path.join(configDir, subagentsPath)
    }
    
    await ensureDir(subagentsPath)
    return subagentsPath
  }

  async getCommandsPath(): Promise<string> {
    const config = await this.load()
    let commandsPath = config.paths.commands
    
    // First expand tilde if present
    commandsPath = expandTilde(commandsPath)
    
    // If project-level config with relative path, resolve relative to config directory
    if (this.isProjectLevel && !path.isAbsolute(commandsPath)) {
      const configDir = path.dirname(this.configPath!)
      commandsPath = path.join(configDir, commandsPath)
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

  async addInstalledMCPServer(name: string, serverConfig?: MCPServerConfig): Promise<void> {
    const config = await this.load()
    
    // Initialize if not exists
    if (!config.installed.mcpServers) {
      config.installed.mcpServers = {}
    }
    
    // Handle both old and new format
    if (Array.isArray(config.installed.mcpServers)) {
      // Convert to new format on the fly
      const oldServers = config.installed.mcpServers as string[]
      const newServers: Record<string, MCPServerConfig> = {}
      for (const serverName of oldServers) {
        newServers[serverName] = {
          provider: 'docker',
          transport: 'stdio',
          scope: 'local',
          installedAt: new Date().toISOString()
        }
      }
      config.installed.mcpServers = newServers
    }
    
    // Add the new server with full config
    const servers = config.installed.mcpServers as Record<string, MCPServerConfig>
    servers[name] = serverConfig || {
      provider: 'docker',
      transport: 'stdio',
      scope: 'local',
      installedAt: new Date().toISOString()
    }
    
    await this.save()
  }

  async removeInstalledMCPServer(name: string): Promise<void> {
    const config = await this.load()
    if (config.installed.mcpServers) {
      if (Array.isArray(config.installed.mcpServers)) {
        config.installed.mcpServers = config.installed.mcpServers.filter(s => s !== name)
      } else {
        delete (config.installed.mcpServers as Record<string, MCPServerConfig>)[name]
      }
      await this.save()
    }
  }

  async getInstalledMCPServers(): Promise<string[]> {
    const config = await this.load()
    if (!config.installed.mcpServers) {
      return []
    }
    
    // Handle both old and new format
    if (Array.isArray(config.installed.mcpServers)) {
      return config.installed.mcpServers
    } else {
      return Object.keys(config.installed.mcpServers)
    }
  }

  async getMCPServerConfig(name: string): Promise<MCPServerConfig | null> {
    const config = await this.load()
    if (!config.installed.mcpServers) {
      return null
    }
    
    // Handle both old and new format
    if (Array.isArray(config.installed.mcpServers)) {
      // Old format - return minimal config
      if (config.installed.mcpServers.includes(name)) {
        return {
          provider: 'docker',
          transport: 'stdio',
          scope: 'local',
          installedAt: new Date().toISOString()
        }
      }
      return null
    } else {
      return (config.installed.mcpServers as Record<string, MCPServerConfig>)[name] || null
    }
  }

  async getAllMCPServerConfigs(): Promise<Record<string, MCPServerConfig>> {
    const config = await this.load()
    if (!config.installed.mcpServers) {
      return {}
    }
    
    // Handle both old and new format
    if (Array.isArray(config.installed.mcpServers)) {
      // Convert old format to new format
      const result: Record<string, MCPServerConfig> = {}
      for (const serverName of config.installed.mcpServers) {
        result[serverName] = {
          provider: 'docker',
          transport: 'stdio',
          scope: 'local',
          installedAt: new Date().toISOString()
        }
      }
      return result
    } else {
      return config.installed.mcpServers as Record<string, MCPServerConfig>
    }
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

  async getAllDependencies(): Promise<{ subagents: string[], commands: string[], mcpServers: string[] }> {
    const config = await this.load()
    const mcpServers = await this.getInstalledMCPServers() // Use the helper method to handle both formats
    return {
      subagents: config.installed.subagents || [],
      commands: config.installed.commands || [],
      mcpServers: mcpServers
    }
  }

  async getConfig(): Promise<BwcConfig> {
    if (!this.config) {
      await this.load()
    }
    return this.config!
  }

  async saveConfig(config: BwcConfig): Promise<void> {
    this.config = config
    return this.save()
  }

  /**
   * Force loading user configuration even if project config exists
   */
  async loadUserConfig(): Promise<BwcConfig> {
    // Reset the config to force reload
    this.config = null
    this.forceUser = true
    
    try {
      const config = await this.load()
      return config
    } finally {
      // Reset forceUser flag after loading
      this.forceUser = false
    }
  }

  /**
   * Reset to default behavior (prefer project config)
   */
  resetToDefault(): void {
    this.config = null
    this.forceUser = false
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  static resetInstance(): void {
    ConfigManager.instance = null
  }
}