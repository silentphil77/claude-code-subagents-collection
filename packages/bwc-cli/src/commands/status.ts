import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import os from 'os'
import { ConfigManager } from '../config/manager.js'
import { logger } from '../utils/logger.js'
import { fileExists, expandTilde } from '../utils/files.js'
import { checkDockerMCPStatus, listInstalledDockerMCPServers } from '../utils/docker-mcp.js'
import { execClaudeCLI } from '../utils/claude-cli.js'
import { execa } from 'execa'

interface StatusReport {
  configScope: {
    active: 'project' | 'user' | 'none'
    projectConfig: { exists: boolean; path: string | null }
    userConfig: { exists: boolean; path: string | null }
  }
  configuration: {
    registry: string
    paths: {
      subagents: string
      commands: string
    }
  }
  installed: {
    subagents: string[]
    commands: string[]
    mcpServers: Record<string, any>
  }
  claudeCLI: {
    available: boolean
    version?: string
    path?: string
  }
  dockerMCP: {
    dockerInstalled: boolean
    dockerVersion?: string
    gatewayRunning: boolean
    installedServers?: string[]
  }
  health: {
    configValid: boolean
    pathsAccessible: boolean
    issues: string[]
  }
}

export function createStatusCommand() {
  const status = new Command('status')
    .description('Display current BWC configuration status and health')
    .option('-j, --json', 'output in JSON format')
    .option('-v, --verbose', 'show detailed information')
    .option('--check', 'perform deep health checks')
    .option('--scope <scope>', 'filter MCP servers by scope (local/user/project)')
    .option('--config <type>', 'force loading user or project config')
    .action(async (options) => {
      try {
        const configManager = ConfigManager.getInstance()
        
        // Collect status information
        const report = await collectStatusReport(configManager, options)
        
        if (options.json) {
          console.log(JSON.stringify(report, null, 2))
        } else {
          await displayStatusReport(report, options)
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })

  return status
}

async function collectStatusReport(configManager: ConfigManager, options: any): Promise<StatusReport> {
  // Check for both configs
  const projectConfigPaths = ['bwc.config.json', '.bwc/config.json']
  let projectConfigPath: string | null = null
  
  // Find project config
  for (const configName of projectConfigPaths) {
    const testPath = path.join(process.cwd(), configName)
    if (await fileExists(testPath)) {
      projectConfigPath = testPath
      break
    }
  }
  
  const userConfigPath = path.join(os.homedir(), '.bwc', 'config.json')
  
  // Determine active config
  let activeConfig: 'project' | 'user' | 'none' = 'none'
  const configScope = {
    active: 'none' as 'project' | 'user' | 'none',
    projectConfig: { exists: false, path: null as string | null },
    userConfig: { exists: false, path: null as string | null }
  }
  
  if (projectConfigPath && await fileExists(projectConfigPath)) {
    configScope.projectConfig = { exists: true, path: projectConfigPath }
    activeConfig = 'project'
  }
  
  if (await fileExists(userConfigPath)) {
    configScope.userConfig = { exists: true, path: userConfigPath }
    if (activeConfig === 'none') {
      activeConfig = 'user'
    }
  }
  
  configScope.active = activeConfig
  
  // Force specific config if requested
  if (options.config === 'user' && configScope.userConfig.exists) {
    await configManager.loadUserConfig()
  } else if (options.config === 'project' && configScope.projectConfig.exists) {
    // Default behavior loads project config
  }
  
  // Load configuration
  let config: any = null
  let registry = ''
  let paths = { subagents: '', commands: '' }
  let installed = { subagents: [], commands: [], mcpServers: {} }
  
  try {
    config = await configManager.getConfig()
    registry = config.registry || ''
    paths = {
      subagents: config.paths?.subagents || '',
      commands: config.paths?.commands || ''
    }
    
    // Get installed items
    installed.subagents = await configManager.getInstalledSubagents()
    installed.commands = await configManager.getInstalledCommands()
    
    // Get MCP servers with full configs
    const mcpConfigs = await configManager.getAllMCPServerConfigs()
    
    // Filter by scope if requested
    if (options.scope) {
      const filteredConfigs: Record<string, any> = {}
      for (const [name, serverConfig] of Object.entries(mcpConfigs)) {
        if (serverConfig.scope === options.scope) {
          filteredConfigs[name] = serverConfig
        }
      }
      installed.mcpServers = filteredConfigs
    } else {
      installed.mcpServers = mcpConfigs
    }
  } catch (error) {
    // Config might not exist yet
  }
  
  // Check Claude CLI
  const claudeCLI = await checkClaudeCLI()
  
  // Check Docker MCP
  const dockerMCP = await checkDockerMCP()
  
  // Perform health checks
  const health = await performHealthChecks(configManager, paths, options.check)
  
  return {
    configScope,
    configuration: {
      registry,
      paths
    },
    installed,
    claudeCLI,
    dockerMCP,
    health
  }
}

async function checkClaudeCLI(): Promise<{ available: boolean; version?: string; path?: string }> {
  try {
    // Try to get Claude CLI version
    const result = await execClaudeCLI(['--version'])
    if (result.stdout) {
      const versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/)
      const version = versionMatch ? versionMatch[1] : 'unknown'
      
      // Try to find Claude path
      let claudePath = 'claude'
      try {
        const { stdout } = await execa('which', ['claude'])
        claudePath = stdout.trim()
      } catch {
        // Ignore, use default
      }
      
      return {
        available: true,
        version,
        path: claudePath
      }
    }
  } catch {
    // Claude CLI not available
  }
  
  return { available: false }
}

async function checkDockerMCP(): Promise<any> {
  const status = await checkDockerMCPStatus()
  const result: any = {
    dockerInstalled: status.dockerInstalled,
    gatewayRunning: status.gatewayConfigured
  }
  
  if (status.dockerInstalled) {
    try {
      const { stdout } = await execa('docker', ['--version'])
      const versionMatch = stdout.match(/Docker version ([0-9.]+)/)
      if (versionMatch) {
        result.dockerVersion = versionMatch[1]
      }
    } catch {
      // Ignore version fetch error
    }
    
    if (status.mcpToolkitAvailable) {
      try {
        const installedServers = await listInstalledDockerMCPServers()
        result.installedServers = installedServers
      } catch {
        // Ignore
      }
    }
  }
  
  return result
}

async function performHealthChecks(
  configManager: ConfigManager,
  paths: { subagents: string; commands: string },
  deepCheck: boolean
): Promise<{ configValid: boolean; pathsAccessible: boolean; issues: string[] }> {
  const issues: string[] = []
  let configValid = true
  let pathsAccessible = true
  
  try {
    await configManager.load()
  } catch (error) {
    configValid = false
    issues.push('Configuration file is invalid or corrupted')
  }
  
  // Check if paths exist and are accessible
  if (paths.subagents) {
    const subagentsPath = expandTilde(paths.subagents)
    if (!await fileExists(subagentsPath)) {
      pathsAccessible = false
      issues.push(`Subagents path does not exist: ${subagentsPath}`)
    }
  }
  
  if (paths.commands) {
    const commandsPath = expandTilde(paths.commands)
    if (!await fileExists(commandsPath)) {
      pathsAccessible = false
      issues.push(`Commands path does not exist: ${commandsPath}`)
    }
  }
  
  if (deepCheck) {
    // Perform additional deep checks
    // Check each installed item exists
    const installedSubagents = await configManager.getInstalledSubagents()
    const subagentsPath = await configManager.getSubagentsPath()
    
    for (const agent of installedSubagents) {
      const agentFile = path.join(subagentsPath, `${agent}.md`)
      if (!await fileExists(agentFile)) {
        issues.push(`Missing subagent file: ${agent}.md`)
      }
    }
    
    const installedCommands = await configManager.getInstalledCommands()
    const commandsPath = await configManager.getCommandsPath()
    
    for (const cmd of installedCommands) {
      const cmdFile = path.join(commandsPath, `${cmd}.md`)
      if (!await fileExists(cmdFile)) {
        issues.push(`Missing command file: ${cmd}.md`)
      }
    }
  }
  
  return {
    configValid,
    pathsAccessible,
    issues
  }
}

async function displayStatusReport(report: StatusReport, options: any) {
  // Header
  console.log()
  console.log(chalk.cyan('╔════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║') + chalk.cyan.bold('                     BWC Status Report                      ') + chalk.cyan('║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════╝'))
  console.log()
  
  // Configuration Scope
  console.log(chalk.bold('Configuration Scope:'))
  
  if (report.configScope.active === 'project') {
    console.log(chalk.yellow.bold('  📍 Active: PROJECT CONFIG (takes precedence)'))
  } else if (report.configScope.active === 'user') {
    console.log(chalk.green.bold('  📍 Active: USER CONFIG'))
  } else {
    console.log(chalk.red.bold('  ⚠️  No configuration found'))
  }
  
  console.log()
  
  if (report.configScope.projectConfig.exists) {
    console.log(`  Project Config: ${chalk.green('✅')} ${report.configScope.projectConfig.path}`)
  } else {
    console.log(`  Project Config: ${chalk.gray('❌ Not found')}`)
  }
  
  if (report.configScope.userConfig.exists) {
    console.log(`  User Config:    ${chalk.green('✅')} ${report.configScope.userConfig.path}`)
  } else {
    console.log(`  User Config:    ${chalk.gray('❌ Not found')}`)
  }
  
  if (report.configScope.active === 'project' && report.configScope.userConfig.exists) {
    console.log()
    console.log(chalk.dim('  ℹ️  Project config overrides user config when present'))
  }
  
  console.log()
  
  // Registry
  if (report.configuration.registry) {
    console.log(chalk.bold('Registry:'))
    console.log(`  URL: ${chalk.cyan(report.configuration.registry)}`)
    console.log()
  }
  
  // Installation Paths
  if (report.configuration.paths.subagents || report.configuration.paths.commands) {
    console.log(chalk.bold('Installation Paths:'))
    if (report.configuration.paths.subagents) {
      const isRelative = !path.isAbsolute(report.configuration.paths.subagents)
      const note = isRelative && report.configScope.active === 'project' ? ' (relative to project)' : ''
      console.log(`  Subagents: ${chalk.cyan(report.configuration.paths.subagents)}${chalk.dim(note)}`)
    }
    if (report.configuration.paths.commands) {
      const isRelative = !path.isAbsolute(report.configuration.paths.commands)
      const note = isRelative && report.configScope.active === 'project' ? ' (relative to project)' : ''
      console.log(`  Commands:  ${chalk.cyan(report.configuration.paths.commands)}${chalk.dim(note)}`)
    }
    console.log()
  }
  
  // Installed Items
  console.log(chalk.bold('Installed Items:'))
  
  // Subagents
  const subagentCount = report.installed.subagents.length
  console.log(`  📦 ${chalk.bold('Subagents')} (${chalk.green(subagentCount)} installed):`)
  if (subagentCount > 0) {
    for (const agent of report.installed.subagents) {
      console.log(`    ${chalk.green('✓')} ${agent}`)
    }
  } else {
    console.log(chalk.gray('    None installed'))
  }
  console.log()
  
  // Commands
  const commandCount = report.installed.commands.length
  console.log(`  ⚡ ${chalk.bold('Commands')} (${chalk.green(commandCount)} installed):`)
  if (commandCount > 0) {
    for (const cmd of report.installed.commands) {
      console.log(`    ${chalk.green('✓')} ${cmd}`)
    }
  } else {
    console.log(chalk.gray('    None installed'))
  }
  console.log()
  
  // MCP Servers
  const mcpServers = Object.entries(report.installed.mcpServers)
  console.log(`  🔌 ${chalk.bold('MCP Servers')} (${chalk.green(mcpServers.length)} installed):`)
  if (mcpServers.length > 0) {
    for (const [name, config] of mcpServers) {
      const scope = config.scope ? `[${chalk.yellow(config.scope)}]` : '[unknown]'
      const transport = `${config.provider || 'unknown'}/${config.transport || 'unknown'}`
      const status = config.verificationStatus === 'verified' ? chalk.green('✅') : 
                     config.verificationStatus === 'community' ? chalk.yellow('👥') : 
                     chalk.gray('🧪')
      
      console.log(`    ${chalk.green('✓')} ${name.padEnd(20)} ${scope.padEnd(12)} ${transport.padEnd(15)} ${status}`)
      
      if (options.verbose && config.installedAt) {
        console.log(chalk.gray(`       Installed: ${new Date(config.installedAt).toLocaleString()}`))
      }
    }
  } else {
    console.log(chalk.gray('    None installed'))
  }
  console.log()
  
  // Claude CLI
  console.log(chalk.bold('Claude CLI:'))
  if (report.claudeCLI.available) {
    console.log(`  Status:  ${chalk.green('✅ Available')}`)
    if (report.claudeCLI.version) {
      console.log(`  Version: ${report.claudeCLI.version}`)
    }
    if (report.claudeCLI.path && options.verbose) {
      console.log(`  Path:    ${report.claudeCLI.path}`)
    }
  } else {
    console.log(`  Status:  ${chalk.yellow('⚠️  Not found')}`)
    console.log(chalk.dim('  Install with: npm install -g @anthropic/claude-cli'))
  }
  console.log()
  
  // Docker MCP
  console.log(chalk.bold('Docker MCP:'))
  if (report.dockerMCP.dockerInstalled) {
    console.log(`  Docker:  ${chalk.green('✅ Installed')}${report.dockerMCP.dockerVersion ? ` (version ${report.dockerMCP.dockerVersion})` : ''}`)
    console.log(`  Gateway: ${report.dockerMCP.gatewayRunning ? chalk.green('✅ Running') : chalk.yellow('⚠️  Not running')}`)
    if (report.dockerMCP.installedServers && report.dockerMCP.installedServers.length > 0) {
      console.log(`  Servers: ${chalk.green(report.dockerMCP.installedServers.length)} installed via Docker MCP`)
    }
  } else {
    console.log(`  Docker:  ${chalk.yellow('⚠️  Not installed')}`)
    console.log(chalk.dim('  Install from: https://www.docker.com/get-started'))
  }
  console.log()
  
  // Health Check
  if (options.check || report.health.issues.length > 0) {
    console.log(chalk.bold('Health Check:'))
    console.log(`  ${report.health.configValid ? chalk.green('✅') : chalk.red('❌')} Configuration ${report.health.configValid ? 'valid' : 'invalid'}`)
    console.log(`  ${report.health.pathsAccessible ? chalk.green('✅') : chalk.yellow('⚠️')} Paths ${report.health.pathsAccessible ? 'accessible' : 'have issues'}`)
    
    if (report.health.issues.length > 0) {
      console.log(chalk.yellow(`  ⚠️  ${report.health.issues.length} issue(s) found:`))
      for (const issue of report.health.issues) {
        console.log(chalk.yellow(`     • ${issue}`))
      }
    } else if (options.check) {
      console.log(chalk.green('  ✅ No issues found'))
    }
    console.log()
  }
  
  // Footer with helpful commands
  if (report.configScope.active === 'none') {
    console.log(chalk.dim('Run "bwc init" to create a configuration'))
  } else if (report.installed.subagents.length === 0 && report.installed.commands.length === 0) {
    console.log(chalk.dim('Run "bwc add" to install subagents, commands, or MCP servers'))
  }
}