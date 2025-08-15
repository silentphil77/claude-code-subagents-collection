import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createAddCommand } from '../../../src/commands/add'
import { ConfigManager } from '../../../src/config/manager'
import { RegistryClient } from '../../../src/registry/client'
import { logger } from '../../../src/utils/logger'
import { createTestDir, cleanupTestDir } from '../../helpers/test-utils'
import path from 'path'
import fs from 'fs-extra'
import inquirer from 'inquirer'

// Mock the logger to prevent console output during tests
const mockSpinner = {
  text: '',
  stop: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  warn: vi.fn(),
  isSpinning: false
}

vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    heading: vi.fn(),
    spinner: vi.fn(() => mockSpinner)
  }
}))

// Mock registry client
vi.mock('../../../src/registry/client', () => ({
  RegistryClient: vi.fn().mockImplementation(() => ({
    findSubagent: vi.fn(),
    findCommand: vi.fn(),
    findMCPServer: vi.fn(),
    getSubagents: vi.fn(),
    getCommands: vi.fn(),
    getMCPServers: vi.fn(),
    fetchFileContent: vi.fn()
  }))
}))

// Mock MCP installer utilities
vi.mock('../../../src/utils/mcp-installer', () => ({
  installMCPServer: vi.fn(),
  configureInClaudeCode: vi.fn()
}))

// Mock MCP JSON utilities
vi.mock('../../../src/utils/mcp-json', () => ({
  addServerToMCPJson: vi.fn()
}))

// Mock Docker MCP utilities
vi.mock('../../../src/utils/docker-mcp', () => ({
  isDockerMCPAvailable: vi.fn(() => false),
  checkDockerMCPStatus: vi.fn(() => Promise.resolve({
    dockerInstalled: false,
    mcpToolkitAvailable: false,
    gatewayConfigured: false
  })),
  setupDockerMCPGateway: vi.fn(),
  enableDockerMCPServer: vi.fn(),
  getDockerMCPServerInfo: vi.fn(),
  listAvailableDockerMCPServers: vi.fn(() => Promise.resolve([])),
  listInstalledDockerMCPServers: vi.fn(() => Promise.resolve([]))
}))

// Mock user input handler
vi.mock('../../../src/utils/user-input-handler', () => ({
  UserInputHandler: vi.fn().mockImplementation(() => ({
    collectInputs: vi.fn(() => Promise.resolve({})),
    validateInputs: vi.fn(() => ({ valid: true, errors: [] })),
    showInputSummary: vi.fn(),
    applyInputsToConfig: vi.fn((config) => Promise.resolve(config))
  }))
}))

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}))

describe('add command', () => {
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
    
    // Create a default config
    const configPath = path.join(testDir, '.bwc', 'config.json')
    await fs.ensureDir(path.dirname(configPath))
    await fs.writeJson(configPath, {
      version: '1.0',
      registry: 'https://buildwithclaude.com/registry.json',
      paths: {
        subagents: '.claude/agents',
        commands: '.claude/commands'
      },
      installed: {
        subagents: [],
        commands: [],
        mcpServers: {}
      }
    })
    
    // Setup mock registry client
    mockRegistryClient = {
      findSubagent: vi.fn(),
      findCommand: vi.fn(),
      findMCPServer: vi.fn(),
      getSubagents: vi.fn(() => Promise.resolve([])),
      getCommands: vi.fn(() => Promise.resolve([])),
      getMCPServers: vi.fn(() => Promise.resolve([])),
      fetchFileContent: vi.fn(() => Promise.resolve('mock content'))
    }
    vi.mocked(RegistryClient).mockImplementation(() => mockRegistryClient)
  })
  
  afterEach(async () => {
    process.cwd = originalCwd
    process.exit = originalExit
    delete process.env.BWC_TEST_HOME
    delete process.env.BWC_CONFIG_PATH
    
    // Clear singleton
    ConfigManager.resetInstance()
    
    // Small delay to ensure file operations complete
    await new Promise(resolve => setTimeout(resolve, 10))
    await cleanupTestDir(testDir)
    
    vi.clearAllMocks()
  })
  
  describe('subagent installation', () => {
    it('should add a specific subagent', async () => {
      mockRegistryClient.findSubagent.mockResolvedValue({
        name: 'test-agent',
        description: 'Test Agent',
        file: 'https://example.com/test-agent.md',
        tools: ['tool1', 'tool2']
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--agent', 'test-agent'])
      
      expect(mockRegistryClient.findSubagent).toHaveBeenCalledWith('test-agent')
      expect(mockRegistryClient.fetchFileContent).toHaveBeenCalledWith('https://example.com/test-agent.md')
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Successfully installed subagent: test-agent')
    })
    
    it('should handle non-existent subagent', async () => {
      mockRegistryClient.findSubagent.mockResolvedValue(null)
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--agent', 'non-existent'])
      
      expect(mockRegistryClient.findSubagent).toHaveBeenCalledWith('non-existent')
      expect(mockRegistryClient.fetchFileContent).not.toHaveBeenCalled()
      expect(mockSpinner.fail).toHaveBeenCalledWith('Subagent "non-existent" not found')
    })
    
    it('should force user-level installation with --user flag', async () => {
      // Create project config
      await fs.writeJson(path.join(testDir, 'bwc.config.json'), {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '.claude/agents/',
          commands: '.claude/commands/'
        },
        installed: {
          subagents: [],
          commands: [],
          mcpServers: {}
        }
      })
      
      mockRegistryClient.findSubagent.mockResolvedValue({
        name: 'test-agent',
        description: 'Test Agent',
        file: 'https://example.com/test-agent.md',
        tools: ['tool1']
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--agent', 'test-agent', '--user'])
      
      expect(logger.info).toHaveBeenCalledWith('Installing to user configuration')
    })
    
    it('should force project-level installation with --project flag', async () => {
      // Create project config
      await fs.writeJson(path.join(testDir, 'bwc.config.json'), {
        version: '1.0',
        registry: 'https://test.com/registry.json',
        paths: {
          subagents: '.claude/agents/',
          commands: '.claude/commands/'
        },
        installed: {
          subagents: [],
          commands: []
        }
      })
      
      // Reset config manager to pick up project config
      ConfigManager.resetInstance()
      
      mockRegistryClient.findSubagent.mockResolvedValue({
        name: 'test-agent',
        description: 'Test Agent',
        file: 'https://example.com/test-agent.md',
        tools: ['tool1']
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--agent', 'test-agent', '--project'])
      
      expect(logger.info).toHaveBeenCalledWith('Installing to project configuration')
    })
  })
  
  describe('command installation', () => {
    it('should add a specific command', async () => {
      mockRegistryClient.findCommand.mockResolvedValue({
        name: 'test-command',
        prefix: '/',
        description: 'Test Command',
        file: 'https://example.com/test-command.md'
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--command', 'test-command'])
      
      expect(mockRegistryClient.findCommand).toHaveBeenCalledWith('test-command')
      expect(mockRegistryClient.fetchFileContent).toHaveBeenCalledWith('https://example.com/test-command.md')
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Successfully installed command: /test-command')
    })
    
    it('should handle non-existent command', async () => {
      mockRegistryClient.findCommand.mockResolvedValue(null)
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--command', 'non-existent'])
      
      expect(mockRegistryClient.findCommand).toHaveBeenCalledWith('non-existent')
      expect(mockRegistryClient.fetchFileContent).not.toHaveBeenCalled()
      expect(mockSpinner.fail).toHaveBeenCalledWith('Command "non-existent" not found')
    })
  })
  
  describe('MCP server installation', () => {
    it('should add MCP server with local scope', async () => {
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test MCP Server',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{"test": "config"}'
        }],
        user_inputs: []
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'test-server'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('test-server')
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('local scope'))
    })
    
    it('should add MCP server with user scope', async () => {
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test MCP Server',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{"test": "config"}'
        }],
        user_inputs: []
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--scope', 'user'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('test-server')
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('user scope'))
    })
    
    it('should add MCP server with project scope', async () => {
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test MCP Server',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{"test": "config"}'
        }],
        user_inputs: []
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--scope', 'project'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('test-server')
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('project scope'))
    })
    
    it('should reject invalid scope', async () => {
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--scope', 'invalid'])
      
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid scope'))
      expect(process.exit).toHaveBeenCalledWith(1)
    })
    
    it('should handle non-existent MCP server', async () => {
      mockRegistryClient.findMCPServer.mockResolvedValue(null)
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'non-existent'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('non-existent')
      expect(mockSpinner.fail).toHaveBeenCalledWith('MCP server "non-existent" not found')
    })
    
    it('should warn about experimental servers', async () => {
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'experimental-server',
        display_name: 'Experimental Server',
        description: 'Test MCP Server',
        verification: { status: 'experimental' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{"test": "config"}'
        }],
        user_inputs: []
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'experimental-server'])
      
      expect(logger.warn).toHaveBeenCalledWith('⚠️  This is an experimental server. Use with caution.')
    })
  })
  
  describe('Docker MCP integration', () => {
    
    it('should setup Docker MCP gateway', async () => {
      const { setupDockerMCPGateway } = await import('../../../src/utils/docker-mcp')
      vi.mocked(setupDockerMCPGateway).mockResolvedValue(undefined)
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--setup'])
      
      expect(setupDockerMCPGateway).toHaveBeenCalledWith('project')
      expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Docker MCP gateway configured'))
    })
    
    it('should use Docker MCP when --docker-mcp flag is provided', async () => {
      const { getDockerMCPServerInfo, listInstalledDockerMCPServers, enableDockerMCPServer, checkDockerMCPStatus } = await import('../../../src/utils/docker-mcp')
      // Set up all mocks explicitly like the working test
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: true,
        mcpToolkitAvailable: true,
        gatewayConfigured: true,
        installedServers: []
      })
      vi.mocked(getDockerMCPServerInfo).mockResolvedValue('Server info')
      vi.mocked(listInstalledDockerMCPServers).mockResolvedValue([]) // Server is not already installed
      vi.mocked(enableDockerMCPServer).mockResolvedValue(undefined)
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'docker-server', '--docker-mcp'])
      
      // The command should complete successfully without calling the regular MCP installation path
      // Since we're using --docker-mcp flag, it should not call the registry client
      expect(mockRegistryClient.findMCPServer).not.toHaveBeenCalled()
      
      // The command should complete without errors
      expect(process.exit).not.toHaveBeenCalled()
    })
    
    it('should track already installed Docker MCP servers', async () => {
      const { getDockerMCPServerInfo, listInstalledDockerMCPServers, checkDockerMCPStatus } = await import('../../../src/utils/docker-mcp')
      // Set up all mocks explicitly
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: true,
        mcpToolkitAvailable: true,
        gatewayConfigured: true,
        installedServers: []
      })
      vi.mocked(getDockerMCPServerInfo).mockResolvedValue('Server info')
      vi.mocked(listInstalledDockerMCPServers).mockResolvedValue(['docker-server']) // Server already installed
      
      vi.mocked(inquirer.prompt).mockResolvedValue({ shouldTrack: true })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'docker-server', '--docker-mcp'])
      
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('already installed in Docker MCP'))
      expect(inquirer.prompt).toHaveBeenCalled()
    })
  })
  
  describe('interactive mode', () => {
    it('should handle interactive subagent selection', async () => {
      mockRegistryClient.getSubagents.mockResolvedValue([
        {
          name: 'agent1',
          description: 'Agent 1',
          category: 'category1',
          file: 'https://example.com/agent1.md',
          tools: []
        },
        {
          name: 'agent2',
          description: 'Agent 2',
          category: 'category2',
          file: 'https://example.com/agent2.md',
          tools: []
        }
      ])
      
      mockRegistryClient.findSubagent.mockResolvedValue({
        name: 'agent1',
        description: 'Agent 1',
        file: 'https://example.com/agent1.md',
        tools: []
      })
      
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ type: 'subagent' })
        .mockResolvedValueOnce({ category: 'All' })
        .mockResolvedValueOnce({ selected: ['agent1'] })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.getSubagents).toHaveBeenCalled()
      expect(mockRegistryClient.findSubagent).toHaveBeenCalledWith('agent1')
    })
    
    it('should handle interactive command selection', async () => {
      mockRegistryClient.getCommands.mockResolvedValue([
        {
          name: 'cmd1',
          prefix: '/',
          description: 'Command 1',
          category: 'category1',
          file: 'https://example.com/cmd1.md'
        }
      ])
      
      mockRegistryClient.findCommand.mockResolvedValue({
        name: 'cmd1',
        prefix: '/',
        description: 'Command 1',
        file: 'https://example.com/cmd1.md'
      })
      
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ type: 'command' })
        .mockResolvedValueOnce({ category: 'All' })
        .mockResolvedValueOnce({ selected: ['cmd1'] })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.getCommands).toHaveBeenCalled()
      expect(mockRegistryClient.findCommand).toHaveBeenCalledWith('cmd1')
    })
    
    it('should handle interactive MCP server selection', async () => {
      // Explicitly ensure Docker MCP is not available for this test
      const { checkDockerMCPStatus } = await import('../../../src/utils/docker-mcp')
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: false,
        mcpToolkitAvailable: false,
        gatewayConfigured: false,
        installedServers: []
      })
      
      mockRegistryClient.getMCPServers.mockResolvedValue([
        {
          name: 'server1',
          display_name: 'Server 1',
          description: 'MCP Server 1',
          verification: { status: 'verified' },
          installation_methods: [{
            type: 'claude-cli',
            recommended: true,
            config_example: '{}'
          }],
          user_inputs: []
        }
      ])
      
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'server1',
        display_name: 'Server 1',
        description: 'MCP Server 1',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{}'
        }],
        user_inputs: []
      })
      
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ type: 'mcp' })
        .mockResolvedValueOnce({ scope: 'local' })
        .mockResolvedValueOnce({ verification: 'All' })
        .mockResolvedValueOnce({ selected: ['server1'] })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.getMCPServers).toHaveBeenCalled()
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('server1')
    })
    
    it('should handle registry connection errors', async () => {
      mockRegistryClient.getSubagents.mockRejectedValue(new Error('Failed to fetch registry'))
      
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ type: 'subagent' })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(logger.error).toHaveBeenCalledWith('Failed to connect to registry. Please check your internet connection.')
    })
  })
  
  describe('environment variables', () => {
    it('should handle environment variables for MCP servers', async () => {
      // Ensure Docker MCP is not available for this test
      const { checkDockerMCPStatus } = await import('../../../src/utils/docker-mcp')
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: false,
        mcpToolkitAvailable: false,
        gatewayConfigured: false,
        installedServers: []
      })
      
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test MCP Server',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{"env": {}}'
        }],
        user_inputs: []
      })
      
      const command = createAddCommand()
      await command.parseAsync(['node', 'test', '--mcp', 'test-server', '--scope', 'project', '-e', 'API_KEY=test123', 'SECRET=value'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('test-server')
      // Environment variables should be passed to the installation
    })
  })
})