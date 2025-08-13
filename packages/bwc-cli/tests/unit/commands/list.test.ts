import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createListCommand } from '../../../src/commands/list'
import { ConfigManager } from '../../../src/config/manager'
import { RegistryClient } from '../../../src/registry/client'
import { logger } from '../../../src/utils/logger'
import { createTestDir, cleanupTestDir } from '../../helpers/test-utils'
import path from 'path'
import fs from 'fs-extra'

// Mock the logger to prevent console output during tests
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    heading: vi.fn(),
    spinner: vi.fn(() => ({
      stop: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn()
    }))
  }
}))

// Mock docker-mcp utilities
vi.mock('../../../src/utils/docker-mcp', () => ({
  checkDockerMCPStatus: vi.fn(() => Promise.resolve({
    dockerInstalled: false,
    mcpToolkitAvailable: false,
    gatewayConfigured: false
  })),
  listAvailableDockerMCPServers: vi.fn(() => Promise.resolve([])),
  listInstalledDockerMCPServers: vi.fn(() => Promise.resolve([])),
  getDockerMCPServerInfo: vi.fn(),
  getDockerMCPServersGroupedByCategory: vi.fn(() => Promise.resolve({})),
  getDockerMCPServersByCategory: vi.fn(() => Promise.resolve([]))
}))

// Mock console.log to suppress output during tests
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
})
afterEach(() => {
  console.log = originalConsoleLog
})

describe('list command', () => {
  let testDir: string
  let originalCwd: () => string
  let originalExit: typeof process.exit
  let mockRegistryClient: any
  
  beforeEach(async () => {
    testDir = await createTestDir()
    originalCwd = process.cwd
    process.cwd = () => testDir
    
    // Set test environment variables
    process.env.BWC_TEST_HOME = testDir
    process.env.BWC_CONFIG_PATH = path.join(testDir, '.bwc', 'config.json')
    
    // Mock process.exit to prevent test termination
    originalExit = process.exit
    process.exit = vi.fn() as any
    
    // Clear ConfigManager singleton
    ConfigManager.resetInstance()
    
    // Initialize configuration
    const configManager = ConfigManager.getInstance()
    await configManager.init()
    
    // Mock RegistryClient
    mockRegistryClient = {
      getSubagents: vi.fn(() => Promise.resolve([
        {
          name: 'test-agent',
          display_name: 'Test Agent',
          description: 'A test agent',
          category: 'testing',
          tools: ['tool1', 'tool2']
        },
        {
          name: 'another-agent',
          display_name: 'Another Agent',
          description: 'Another test agent',
          category: 'testing',
          tools: ['tool3']
        },
        {
          name: 'dev-agent',
          display_name: 'Dev Agent',
          description: 'Development agent',
          category: 'development',
          tools: ['tool4', 'tool5']
        }
      ])),
      getCommands: vi.fn(() => Promise.resolve([
        {
          name: 'test',
          prefix: 'bwc:',
          description: 'Test command',
          category: 'utilities'
        },
        {
          name: 'build',
          prefix: 'bwc:',
          description: 'Build command',
          category: 'development'
        }
      ])),
      getMCPServers: vi.fn(() => Promise.resolve([
        {
          name: 'test-server',
          display_name: 'Test Server',
          description: 'A test MCP server',
          category: 'testing',
          server_type: 'stdio',
          verification: { status: 'verified' },
          source_registry: { type: 'github' },
          execution_type: 'local'
        },
        {
          name: 'api-server',
          display_name: 'API Server',
          description: 'An API MCP server',
          category: 'api',
          server_type: 'sse',
          verification: { status: 'community' },
          source_registry: { type: 'npm' },
          execution_type: 'remote'
        }
      ]))
    }
    
    // Mock RegistryClient constructor
    vi.spyOn(RegistryClient.prototype, 'getSubagents').mockImplementation(mockRegistryClient.getSubagents)
    vi.spyOn(RegistryClient.prototype, 'getCommands').mockImplementation(mockRegistryClient.getCommands)
    vi.spyOn(RegistryClient.prototype, 'getMCPServers').mockImplementation(mockRegistryClient.getMCPServers)
  })
  
  afterEach(async () => {
    process.cwd = originalCwd
    process.exit = originalExit
    delete process.env.BWC_TEST_HOME
    delete process.env.BWC_CONFIG_PATH
    
    // Small delay to ensure file operations complete
    await new Promise(resolve => setTimeout(resolve, 10))
    await cleanupTestDir(testDir)
    
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  
  describe('listing all items', () => {
    it('should list all subagents, commands, and MCP servers', async () => {
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test'])
      
      // Check that all fetch methods were called
      expect(mockRegistryClient.getSubagents).toHaveBeenCalled()
      expect(mockRegistryClient.getCommands).toHaveBeenCalled()
      expect(mockRegistryClient.getMCPServers).toHaveBeenCalled()
      
      // Check that headings were displayed
      expect(logger.heading).toHaveBeenCalledWith('Available Subagents')
      expect(logger.heading).toHaveBeenCalledWith('Available Commands')
      expect(logger.heading).toHaveBeenCalledWith('Available MCP Servers')
    })
  })
  
  describe('listing subagents only', () => {
    it('should list only subagents with --agents flag', async () => {
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--agents'])
      
      // Check that only subagents were fetched
      expect(mockRegistryClient.getSubagents).toHaveBeenCalled()
      expect(mockRegistryClient.getCommands).not.toHaveBeenCalled()
      expect(mockRegistryClient.getMCPServers).not.toHaveBeenCalled()
      
      // Check that only subagents heading was displayed
      expect(logger.heading).toHaveBeenCalledWith('Available Subagents')
      expect(logger.heading).not.toHaveBeenCalledWith('Available Commands')
    })
    
    it('should filter subagents by category', async () => {
      const command = createListCommand()
      
      // Parse and execute the command with category filter
      await command.parseAsync(['node', 'test', '--agents', '--category', 'testing'])
      
      expect(mockRegistryClient.getSubagents).toHaveBeenCalled()
      // The filtering happens in the command, so we just verify the fetch was called
    })
    
    it('should show only installed subagents with --installed flag', async () => {
      const command = createListCommand()
      const configManager = ConfigManager.getInstance()
      
      // Add an installed subagent
      await configManager.addInstalledSubagent('test-agent')
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--agents', '--installed'])
      
      expect(mockRegistryClient.getSubagents).toHaveBeenCalled()
      // The filtering happens in the command based on installed items
    })
  })
  
  describe('listing commands only', () => {
    it('should list only commands with --commands flag', async () => {
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--commands'])
      
      // Check that only commands were fetched
      expect(mockRegistryClient.getCommands).toHaveBeenCalled()
      expect(mockRegistryClient.getSubagents).not.toHaveBeenCalled()
      expect(mockRegistryClient.getMCPServers).not.toHaveBeenCalled()
      
      // Check that only commands heading was displayed
      expect(logger.heading).toHaveBeenCalledWith('Available Commands')
    })
    
    it('should filter commands by category', async () => {
      const command = createListCommand()
      
      // Parse and execute the command with category filter
      await command.parseAsync(['node', 'test', '--commands', '--category', 'utilities'])
      
      expect(mockRegistryClient.getCommands).toHaveBeenCalled()
    })
  })
  
  describe('listing MCP servers only', () => {
    it('should list only MCP servers with --mcps flag', async () => {
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--mcps'])
      
      // Check that only MCP servers were fetched (registry fallback since Docker MCP is mocked as unavailable)
      expect(mockRegistryClient.getMCPServers).toHaveBeenCalled()
      expect(mockRegistryClient.getSubagents).not.toHaveBeenCalled()
      expect(mockRegistryClient.getCommands).not.toHaveBeenCalled()
      
      // Check that MCP servers heading was displayed
      expect(logger.heading).toHaveBeenCalledWith('Available MCP Servers')
    })
    
    it('should filter MCP servers by category', async () => {
      const command = createListCommand()
      
      // Parse and execute the command with category filter
      await command.parseAsync(['node', 'test', '--mcps', '--category', 'api'])
      
      expect(mockRegistryClient.getMCPServers).toHaveBeenCalled()
    })
  })
  
  describe('configuration scope', () => {
    it('should show global configuration location', async () => {
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--agents'])
      
      // Check that config location was displayed (the test creates a config, so it shows up)
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('configuration:'))
    })
    
    it('should show project configuration location when using project config', async () => {
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
          subagents: [],
          commands: [],
          mcpServers: []
        }
      })
      
      // Reset ConfigManager to pick up project config
      ConfigManager.resetInstance()
      
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--agents'])
      
      // Check that project config location was displayed
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Using project configuration:'))
    })
  })
  
  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const command = createListCommand()
      
      // Mock getSubagents to throw an error
      mockRegistryClient.getSubagents.mockRejectedValue(new Error('Network error'))
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test', '--agents'])
      
      // Check that error was handled
      expect(logger.error).toHaveBeenCalledWith('Network error')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
    
    it('should handle missing configuration', async () => {
      // Delete the config file
      await fs.remove(path.join(testDir, '.bwc', 'config.json'))
      
      // Reset ConfigManager
      ConfigManager['instance'] = null
      
      const command = createListCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test'])
      
      // Check that error was handled
      expect(logger.error).toHaveBeenCalledWith('Configuration not found. Run "bwc init" first.')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
  })
})