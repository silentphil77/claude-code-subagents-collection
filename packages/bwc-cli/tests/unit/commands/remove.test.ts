import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRemoveCommand } from '../../../src/commands/remove'
import { ConfigManager } from '../../../src/config/manager'
import { logger } from '../../../src/utils/logger'
import { createTestDir, cleanupTestDir } from '../../helpers/test-utils'
import path from 'path'
import fs from 'fs-extra'
import inquirer from 'inquirer'

// Mock the logger to prevent console output during tests
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    spinner: vi.fn(() => ({
      succeed: vi.fn(),
      fail: vi.fn()
    }))
  }
}))

// Mock inquirer for testing prompts
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}))

// Mock docker-mcp utilities
vi.mock('../../../src/utils/docker-mcp', () => ({
  checkDockerMCPStatus: vi.fn(() => Promise.resolve({
    dockerInstalled: false,
    mcpToolkitAvailable: false,
    gatewayConfigured: false
  })),
  disableDockerMCPServer: vi.fn(),
  listInstalledDockerMCPServers: vi.fn(() => Promise.resolve([]))
}))

// Mock mcp-json utilities
vi.mock('../../../src/utils/mcp-json', () => ({
  removeServerFromMCPJson: vi.fn(() => Promise.resolve(false))
}))

// Mock mcp-remover utilities
vi.mock('../../../src/utils/mcp-remover', () => ({
  removeFromClaudeCode: vi.fn(() => Promise.resolve(false))
}))

describe('remove command', () => {
  let testDir: string
  let originalCwd: () => string
  let originalExit: typeof process.exit
  
  beforeEach(async () => {
    // Create a unique test directory for each test
    testDir = await createTestDir()
    originalCwd = process.cwd
    process.cwd = () => testDir
    
    // Set test environment variables with unique paths
    process.env.BWC_TEST_HOME = testDir
    process.env.BWC_CONFIG_PATH = path.join(testDir, '.bwc', 'config.json')
    
    // Mock process.exit to prevent test termination
    originalExit = process.exit
    process.exit = vi.fn() as any
    
    // Clear ConfigManager singleton BEFORE each test
    ConfigManager.resetInstance()
    
    // Initialize configuration with clean state
    const configManager = ConfigManager.getInstance()
    await configManager.init({ force: true }) // Force to ensure clean state
  })
  
  afterEach(async () => {
    process.cwd = originalCwd
    process.exit = originalExit
    delete process.env.BWC_TEST_HOME
    delete process.env.BWC_CONFIG_PATH
    
    // Clear ConfigManager singleton after test
    ConfigManager.resetInstance()
    
    // Small delay to ensure file operations complete
    await new Promise(resolve => setTimeout(resolve, 10))
    await cleanupTestDir(testDir)
    
    vi.clearAllMocks()
  })
  
  describe('removing subagents', () => {
    it('should remove an installed subagent with --agent flag', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add a subagent first
      await configManager.addInstalledSubagent('test-agent')
      const agentsPath = await configManager.getSubagentsPath()
      const agentFile = path.join(agentsPath, 'test-agent.md')
      await fs.writeFile(agentFile, '# Test Agent')
      
      // Parse and execute the command with --yes to skip confirmation
      await command.parseAsync(['node', 'test', '--agent', 'test-agent', '--yes'])
      
      // Check that subagent was removed
      const installed = await configManager.getInstalledSubagents()
      expect(installed).not.toContain('test-agent')
      expect(await fs.pathExists(agentFile)).toBe(false)
      
      // Check logger calls
      expect(logger.spinner).toHaveBeenCalledWith('Removing subagent: test-agent')
    })
    
    it('should warn if subagent is not installed', async () => {
      const command = createRemoveCommand()
      
      // Try to remove non-existent subagent
      await command.parseAsync(['node', 'test', '--agent', 'non-existent', '--yes'])
      
      // Check warning was logged
      expect(logger.warn).toHaveBeenCalledWith('Subagent "non-existent" is not installed')
    })
    
    it('should prompt for confirmation without --yes flag', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add a subagent
      await configManager.addInstalledSubagent('test-agent')
      
      // Mock inquirer to deny confirmation
      vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: false })
      
      // Try to remove
      await command.parseAsync(['node', 'test', '--agent', 'test-agent'])
      
      // Check that removal was cancelled
      expect(logger.info).toHaveBeenCalledWith('Removal cancelled')
      const installed = await configManager.getInstalledSubagents()
      expect(installed).toContain('test-agent')
    })
  })
  
  describe('removing commands', () => {
    it('should remove an installed command with --command flag', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add a command first
      await configManager.addInstalledCommand('test-cmd')
      const commandsPath = await configManager.getCommandsPath()
      const cmdFile = path.join(commandsPath, 'test-cmd.md')
      await fs.writeFile(cmdFile, '# Test Command')
      
      // Parse and execute the command with --yes to skip confirmation
      await command.parseAsync(['node', 'test', '--command', 'test-cmd', '--yes'])
      
      // Check that command was removed
      const installed = await configManager.getInstalledCommands()
      expect(installed).not.toContain('test-cmd')
      expect(await fs.pathExists(cmdFile)).toBe(false)
      
      // Check logger calls
      expect(logger.spinner).toHaveBeenCalledWith('Removing command: test-cmd')
    })
    
    it('should warn if command is not installed', async () => {
      const command = createRemoveCommand()
      
      // Try to remove non-existent command
      await command.parseAsync(['node', 'test', '--command', 'non-existent', '--yes'])
      
      // Check warning was logged
      expect(logger.warn).toHaveBeenCalledWith('Command "non-existent" is not installed')
    })
  })
  
  describe('removing MCP servers', () => {
    it('should remove an installed MCP server with --mcp flag', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add an MCP server first
      await configManager.addInstalledMCPServer('test-server', {
        provider: 'docker',
        transport: 'stdio',
        scope: 'local'
      })
      
      // Parse and execute the command with --yes to skip confirmation
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--yes'])
      
      // Check that server was removed
      const installed = await configManager.getInstalledMCPServers()
      expect(installed).not.toContain('test-server')
      
      // Check logger calls
      expect(logger.spinner).toHaveBeenCalledWith('Removing MCP server: test-server')
    })
    
    it('should validate scope parameter', async () => {
      const command = createRemoveCommand()
      
      // Try with invalid scope
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--scope', 'invalid'])
      
      // Check error was logged
      expect(logger.error).toHaveBeenCalledWith('Invalid scope: invalid. Must be one of: local, user, project')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
    
    it('should warn if MCP server is not installed', async () => {
      const command = createRemoveCommand()
      
      // Try to remove non-existent server
      await command.parseAsync(['node', 'test', '--mcp', 'non-existent', '--yes'])
      
      // Check warning was logged
      expect(logger.warn).toHaveBeenCalledWith('MCP server "non-existent" is not installed')
    })
  })
  
  describe('configuration scope', () => {
    it('should use project configuration by default when available', async () => {
      // Create project config
      const projectConfigPath = path.join(testDir, 'bwc.config.json')
      await fs.writeJson(projectConfigPath, {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '.claude/agents/',
          commands: '.claude/commands/'
        },
        installed: {
          subagents: ['project-agent'],
          commands: [],
          mcpServers: []
        }
      })
      
      // Reset ConfigManager to pick up project config
      ConfigManager.resetInstance()
      
      const command = createRemoveCommand()
      
      // Remove a subagent
      await command.parseAsync(['node', 'test', '--agent', 'project-agent', '--yes'])
      
      // Check that project config was used
      expect(logger.info).toHaveBeenCalledWith('Removing from project configuration')
    })
    
    it('should force user-level removal with --user flag', async () => {
      // Create both project and user configs
      const projectConfigPath = path.join(testDir, 'bwc.config.json')
      await fs.writeJson(projectConfigPath, {
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
      })
      
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add agent to user config
      await configManager.loadUserConfig()
      await configManager.addInstalledSubagent('user-agent')
      
      // Reset ConfigManager
      ConfigManager.resetInstance()
      
      // Remove with --user flag
      await command.parseAsync(['node', 'test', '--agent', 'user-agent', '--user', '--yes'])
      
      // Check that user config was used
      expect(logger.info).toHaveBeenCalledWith('Removing from user configuration')
    })
    
    it('should force project-level removal with --project flag', async () => {
      // Create project config
      const projectConfigPath = path.join(testDir, 'bwc.config.json')
      await fs.writeJson(projectConfigPath, {
        version: '1.0',
        registry: 'https://test.com/registry.json',
        paths: {
          subagents: '.claude/agents/',
          commands: '.claude/commands/'
        },
        installed: {
          subagents: ['project-agent-test'],
          commands: []
        }
      })
      
      // Reset config manager
      ConfigManager.resetInstance()
      
      const command = createRemoveCommand()
      await command.parseAsync(['node', 'test', '--agent', 'project-agent-test', '--project', '--yes'])
      
      expect(logger.info).toHaveBeenCalledWith('Removing from project configuration')
    })
  })
  
  describe('interactive mode', () => {
    it('should prompt for type selection when no flags provided', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add some items
      await configManager.addInstalledSubagent('test-agent')
      
      // Mock inquirer prompts
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ type: 'subagent' })
        .mockResolvedValueOnce({ selected: ['test-agent'] })
        .mockResolvedValueOnce({ confirm: true })
      
      // Run interactive mode
      await command.parseAsync(['node', 'test'])
      
      // Check that prompts were called
      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'list',
            name: 'type',
            message: 'What would you like to remove?'
          })
        ])
      )
    })
    
    it('should warn if no items are installed in interactive mode', async () => {
      // Reset singleton and create fresh instance
      ConfigManager.resetInstance()
      const configManager = ConfigManager.getInstance()
      
      // Ensure config is initialized
      try {
        await configManager.init({ force: true })
      } catch {
        // Config might already exist, that's ok
      }
      
      // Clear all installed items to ensure empty state
      const config = await configManager.getConfig()
      config.installed.subagents = []
      config.installed.commands = []
      config.installed.mcpServers = {}
      await configManager.saveConfig(config)
      
      const command = createRemoveCommand()
      
      // Mock inquirer to select subagent
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ type: 'subagent' })
      
      // Run interactive mode with no installed items
      await command.parseAsync(['node', 'test'])
      
      // Check warning was shown
      expect(logger.warn).toHaveBeenCalledWith('No subagents installed')
    })
  })
  
  describe('error handling', () => {
    it('should handle file deletion errors gracefully', async () => {
      const command = createRemoveCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add a subagent
      await configManager.addInstalledSubagent('test-agent')
      
      // Mock file deletion to throw error
      const agentsPath = await configManager.getSubagentsPath()
      const agentFile = path.join(agentsPath, 'test-agent.md')
      await fs.writeFile(agentFile, '# Test', { mode: 0o000 }) // No permissions
      
      // Try to remove (this may or may not fail depending on OS/permissions)
      await command.parseAsync(['node', 'test', '--agent', 'test-agent', '--yes'])
      
      // Either succeeds or handles error
      expect(process.exit).toHaveBeenCalledTimes(0) // Should not crash
    })
  })
})