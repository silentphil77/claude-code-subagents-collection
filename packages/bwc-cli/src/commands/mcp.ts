import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { RegistryClient } from '../registry/client.js'
import { 
  MCPServer, 
  MCPInstallationMethod, 
  VERIFICATION_STATUS,
  MCP_CATEGORIES,
  SOURCE_PREFERENCE 
} from '../registry/types.js'
import { ConfigManager } from '../config/manager.js'
import { logger } from '../utils/logger.js'
import { installMCPServer, configureInClaudeCode } from '../utils/mcp-installer.js'

export function createMCPCommand() {
  const mcp = new Command('mcp')
    .description('Manage MCP (Model Context Protocol) servers (DEPRECATED: Use unified commands instead)')
    .hook('preAction', () => {
      logger.warn('⚠️  The "mcp" command is deprecated and will be removed in a future version.')
      logger.warn('Please use the unified commands instead:')
      logger.warn('  bwc add --mcp <name>      (instead of: bwc mcp add <name>)')
      logger.warn('  bwc list --mcps           (instead of: bwc mcp list)')
      logger.warn('  bwc search --mcps <query> (instead of: bwc mcp search <query>)')
      logger.warn('  bwc remove --mcp <name>   (instead of: bwc mcp remove <name>)')
      logger.warn('  bwc info --mcp <name>     (instead of: bwc mcp info <name>)')
      console.log()
    })

  // List MCP servers
  mcp
    .command('list')
    .alias('ls')
    .description('List available MCP servers')
    .option('-c, --category <category>', 'Filter by category')
    .option('-v, --verification <status>', 'Filter by verification status (verified, community, experimental)')
    .option('--installed', 'Show only installed servers')
    .action(async (options) => {
      const spinner = ora('Fetching MCP servers...').start()
      
      try {
        const registry = await RegistryClient.getInstance()
        const servers = await registry.listMCPServers()
        
        let filtered = servers
        
        // Apply filters
        if (options.category) {
          filtered = filtered.filter(s => s.category === options.category)
        }
        
        if (options.verification) {
          filtered = filtered.filter(s => s.verification.status === options.verification)
        }
        
        if (options.installed) {
          const config = ConfigManager.getInstance()
          const cfg = await config.getConfig()
          const installed = cfg.installed.mcpServers || []
          filtered = filtered.filter(s => installed.includes(s.name))
        }
        
        spinner.stop()
        
        if (filtered.length === 0) {
          console.log(chalk.yellow('No MCP servers found matching your criteria'))
          return
        }
        
        // Group by category
        const grouped = filtered.reduce((acc, server) => {
          if (!acc[server.category]) acc[server.category] = []
          acc[server.category].push(server)
          return acc
        }, {} as Record<string, MCPServer[]>)
        
        // Display servers
        Object.entries(grouped).forEach(([category, servers]) => {
          const categoryInfo = MCP_CATEGORIES[category as keyof typeof MCP_CATEGORIES]
          console.log(`\n${categoryInfo.icon} ${chalk.bold(categoryInfo.name)}`)
          
          servers.forEach(server => {
            const status = VERIFICATION_STATUS[server.verification.status]
            console.log(
              `  ${status.icon} ${chalk.cyan(server.name)} - ${server.description}`
            )
            
            if (server.stats) {
              const stats = []
              if (server.stats.github_stars) stats.push(`⭐ ${server.stats.github_stars}`)
              if (server.stats.docker_pulls) stats.push(`🐳 ${server.stats.docker_pulls}`)
              if (stats.length > 0) {
                console.log(`     ${chalk.gray(stats.join(' | '))}`)
              }
            }
          })
        })
        
        console.log(`\n${chalk.gray(`Total: ${filtered.length} servers`)}`)
        
      } catch (error) {
        spinner.fail('Failed to fetch MCP servers')
        logger.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // Add MCP server
  mcp
    .command('add <name>')
    .description('Add an MCP server')
    .option('-s, --source <source>', 'Installation source (docker, npm, manual)')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (name, options) => {
      const spinner = ora('Fetching server details...').start()
      
      try {
        const registry = await RegistryClient.getInstance()
        const server = await registry.getMCPServer(name)
        
        if (!server) {
          spinner.fail(`MCP server '${name}' not found`)
          process.exit(1)
        }
        
        spinner.stop()
        
        // Show server details
        const status = VERIFICATION_STATUS[server.verification.status]
        console.log(`\n${chalk.bold(server.display_name)}`)
        console.log(`${status.icon} ${status.label} - ${server.description}`)
        console.log(`Category: ${MCP_CATEGORIES[server.category as keyof typeof MCP_CATEGORIES].name}`)
        console.log(`Protocol: ${server.protocol_version}`)
        
        // Security warning for experimental
        if (server.verification.status === 'experimental') {
          console.log(chalk.yellow('\n⚠️  Warning: This is an experimental server. Use with caution.'))
        }
        
        // Select installation method
        let method: MCPInstallationMethod | undefined
        
        if (options.source) {
          method = server.installation_methods.find(m => m.type === options.source)
          if (!method) {
            console.log(chalk.red(`Installation method '${options.source}' not available`))
            process.exit(1)
          }
        } else {
          // Auto-select based on preference
          for (const pref of SOURCE_PREFERENCE) {
            method = server.installation_methods.find(m => m.type === pref)
            if (method) break
          }
          
          if (!method) {
            method = server.installation_methods[0]
          }
        }
        
        // Confirm installation
        if (!options.yes) {
          const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Install ${server.name} using ${method.type}?`,
            default: true
          }])
          
          if (!confirm) {
            console.log('Installation cancelled')
            return
          }
        }
        
        // Install server
        const installSpinner = ora(`Installing ${server.name}...`).start()
        
        try {
          await installMCPServer(server, method)
          
          installSpinner.succeed(`Successfully installed ${server.name}`)
          
          // Update config
          const config = ConfigManager.getInstance()
          const cfg = await config.getConfig()
          if (!cfg.installed.mcpServers) cfg.installed.mcpServers = []
          if (!cfg.installed.mcpServers.includes(server.name)) {
            cfg.installed.mcpServers.push(server.name)
            await config.saveConfig(cfg)
          }
          
          // Configure in Claude Code if possible
          await configureInClaudeCode(server, method, { scope: 'local', envVars: [] })
          
          console.log('\n' + chalk.green('✓ MCP server installed successfully!'))
          
        } catch (error) {
          installSpinner.fail('Installation failed')
          throw error
        }
        
      } catch (error) {
        spinner.fail('Failed to add MCP server')
        logger.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // Remove MCP server
  mcp
    .command('remove <name>')
    .alias('rm')
    .description('Remove an installed MCP server')
    .action(async (name) => {
      try {
        const config = ConfigManager.getInstance()
        const cfg = await config.getConfig()
        
        if (!cfg.installed.mcpServers?.includes(name)) {
          console.log(chalk.yellow(`MCP server '${name}' is not installed`))
          return
        }
        
        // Remove from config
        cfg.installed.mcpServers = cfg.installed.mcpServers.filter(s => s !== name)
        await config.saveConfig(cfg)
        
        console.log(chalk.green(`✓ Removed ${name} from installed servers`))
        console.log(chalk.gray('Note: You may need to manually remove the server configuration from your client'))
        
      } catch (error) {
        logger.error(`Failed to remove MCP server: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(1)
      }
    })

  // Show MCP server info
  mcp
    .command('info <name>')
    .description('Show detailed information about an MCP server')
    .action(async (name) => {
      const spinner = ora('Fetching server details...').start()
      
      try {
        const registry = await RegistryClient.getInstance()
        const server = await registry.getMCPServer(name)
        
        if (!server) {
          spinner.fail(`MCP server '${name}' not found`)
          process.exit(1)
        }
        
        spinner.stop()
        
        // Display detailed info
        const status = VERIFICATION_STATUS[server.verification.status]
        console.log(`\n${chalk.bold(server.display_name)}`)
        console.log(`${status.icon} ${status.label}`)
        console.log(`\n${server.description}`)
        
        console.log('\n' + chalk.bold('Details:'))
        console.log(`Category: ${MCP_CATEGORIES[server.category as keyof typeof MCP_CATEGORIES].name}`)
        console.log(`Server Type: ${server.server_type}`)
        console.log(`Protocol Version: ${server.protocol_version}`)
        
        if (server.security) {
          console.log('\n' + chalk.bold('Security:'))
          console.log(`Authentication: ${server.security.auth_type}`)
          console.log(`Permissions: ${server.security.permissions.join(', ')}`)
        }
        
        if (server.stats) {
          console.log('\n' + chalk.bold('Stats:'))
          if (server.stats.github_stars) console.log(`GitHub Stars: ⭐ ${server.stats.github_stars}`)
          if (server.stats.docker_pulls) console.log(`Docker Pulls: 🐳 ${server.stats.docker_pulls}`)
          if (server.stats.npm_downloads) console.log(`NPM Downloads: 📦 ${server.stats.npm_downloads}`)
        }
        
        console.log('\n' + chalk.bold('Installation Methods:'))
        server.installation_methods.forEach(method => {
          const recommended = method.recommended ? ' (recommended)' : ''
          console.log(`- ${method.type}${recommended}`)
        })
        
        console.log('\n' + chalk.bold('Sources:'))
        if (server.sources.official) console.log(`Official: ${server.sources.official}`)
        if (server.sources.docker) console.log(`Docker: ${server.sources.docker}`)
        if (server.sources.npm) console.log(`NPM: ${server.sources.npm}`)
        
        if (server.verification.tested_with) {
          console.log('\n' + chalk.bold('Tested With:'))
          console.log(server.verification.tested_with.join(', '))
        }
        
      } catch (error) {
        spinner.fail('Failed to fetch server info')
        logger.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // Search MCP servers
  mcp
    .command('search <query>')
    .description('Search for MCP servers')
    .action(async (query) => {
      const spinner = ora('Searching...').start()
      
      try {
        const registry = await RegistryClient.getInstance()
        const results = await registry.searchMCPServers(query)
        
        spinner.stop()
        
        if (results.length === 0) {
          console.log(chalk.yellow(`No MCP servers found matching '${query}'`))
          return
        }
        
        console.log(`\nFound ${results.length} servers:\n`)
        
        results.forEach(server => {
          const status = VERIFICATION_STATUS[server.verification.status]
          console.log(`${status.icon} ${chalk.cyan(server.name)} - ${server.description}`)
        })
        
      } catch (error) {
        spinner.fail('Search failed')
        logger.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  return mcp
}