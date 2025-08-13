import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createInstallCommand } from '../../../src/commands/install'
import { ConfigManager } from '../../../src/config/manager'
import { RegistryClient } from '../../../src/registry/client'
import { logger } from '../../../src/utils/logger'
import { createTestDir, cleanupTestDir } from '../../helpers/test-utils'
import path from 'path'
import fs from 'fs-extra'

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

// Import mocked functions for direct use
import { checkDockerMCPStatus, setupDockerMCPGateway, enableDockerMCPServer } from '../../../src/utils/docker-mcp'
import { isClaudeCLIAvailable, execClaudeCLI } from '../../../src/utils/claude-cli'

// Mock Docker MCP utilities
vi.mock('../../../src/utils/docker-mcp', () => ({
  checkDockerMCPStatus: vi.fn(() => Promise.resolve({
    dockerInstalled: false,
    mcpToolkitAvailable: false,
    gatewayConfigured: false
  })),
  setupDockerMCPGateway: vi.fn(),
  enableDockerMCPServer: vi.fn()
}))

// Mock Claude CLI utilities
vi.mock('../../../src/utils/claude-cli', () => ({
  isClaudeCLIAvailable: vi.fn(() => Promise.resolve(false)),
  execClaudeCLI: vi.fn()
}))

describe('install command', () => {
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
    
    // Setup mock registry client
    mockRegistryClient = {
      findSubagent: vi.fn(),
      findCommand: vi.fn(),
      findMCPServer: vi.fn(),
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
  
  describe('basic installation', () => {
    it('should handle empty configuration', async () => {
      // Create config with no dependencies
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
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(logger.info).toHaveBeenCalledWith('No dependencies to install.')
    })
    
    it('should install subagents from configuration', async () => {
      // Create config with subagents
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
          subagents: ['agent1', 'agent2'],
          commands: [],
          mcpServers: {}
        }
      })
      
      mockRegistryClient.findSubagent
        .mockResolvedValueOnce({
          name: 'agent1',
          description: 'Agent 1',
          file: 'https://example.com/agent1.md'
        })
        .mockResolvedValueOnce({
          name: 'agent2',
          description: 'Agent 2',
          file: 'https://example.com/agent2.md'
        })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.findSubagent).toHaveBeenCalledWith('agent1')
      expect(mockRegistryClient.findSubagent).toHaveBeenCalledWith('agent2')
      expect(mockRegistryClient.fetchFileContent).toHaveBeenCalledTimes(2)
      expect(logger.success).toHaveBeenCalledWith('Installation complete!')
    })
    
    it('should install commands from configuration', async () => {
      // Create config with commands
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
          commands: ['cmd1', 'cmd2'],
          mcpServers: {}
        }
      })
      
      mockRegistryClient.findCommand
        .mockResolvedValueOnce({
          name: 'cmd1',
          prefix: '/',
          description: 'Command 1',
          file: 'https://example.com/cmd1.md'
        })
        .mockResolvedValueOnce({
          name: 'cmd2',
          prefix: '/',
          description: 'Command 2',
          file: 'https://example.com/cmd2.md'
        })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.findCommand).toHaveBeenCalledWith('cmd1')
      expect(mockRegistryClient.findCommand).toHaveBeenCalledWith('cmd2')
      expect(mockRegistryClient.fetchFileContent).toHaveBeenCalledTimes(2)
      expect(logger.success).toHaveBeenCalledWith('Installation complete!')
    })
    
    it('should handle missing items in registry', async () => {
      // Create config with items
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
          subagents: ['missing-agent'],
          commands: ['missing-cmd'],
          mcpServers: {}
        }
      })
      
      mockRegistryClient.findSubagent.mockResolvedValue(null)
      mockRegistryClient.findCommand.mockResolvedValue(null)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Subagent "missing-agent" not found in registry')
      expect(mockSpinner.fail).toHaveBeenCalledWith('Command "missing-cmd" not found in registry')
    })
  })
  
  describe('MCP server installation', () => {
    it('should install MCP servers with stored configurations', async () => {
      // Create config with MCP servers
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
          mcpServers: {
            'test-server': {
              provider: 'claude',
              transport: 'stdio',
              scope: 'local',
              command: 'test-command',
              args: ['arg1', 'arg2'],
              env: { KEY: 'value' }
            }
          }
        }
      })
      
      vi.mocked(isClaudeCLIAvailable).mockResolvedValue(true)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(execClaudeCLI).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('MCP servers installation complete'))
    })
    
    it('should handle Docker MCP servers', async () => {
      // Create config with Docker MCP server
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
          mcpServers: {
            'docker-server': {
              provider: 'docker',
              transport: 'stdio',
              scope: 'local'
            }
          }
        }
      })
      
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: true,
        mcpToolkitAvailable: true,
        gatewayConfigured: true
      })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(enableDockerMCPServer).toHaveBeenCalledWith('docker-server')
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Enabled Docker MCP server: docker-server')
    })
    
    it('should skip Docker MCP servers when Docker is not available', async () => {
      // Create config with Docker MCP server
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
          mcpServers: {
            'docker-server': {
              provider: 'docker',
              transport: 'stdio',
              scope: 'local'
            }
          }
        }
      })
      
      vi.mocked(checkDockerMCPStatus).mockResolvedValue({
        dockerInstalled: false,
        mcpToolkitAvailable: false,
        gatewayConfigured: false
      })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(enableDockerMCPServer).not.toHaveBeenCalled()
      expect(mockSpinner.warn).toHaveBeenCalledWith('Docker MCP not available, skipping docker-server')
    })
    
    it('should show manual configuration when Claude CLI is not available', async () => {
      // Create config with Claude MCP server
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
          mcpServers: {
            'claude-server': {
              provider: 'claude',
              transport: 'stdio',
              scope: 'local',
              command: 'test-command'
            }
          }
        }
      })
      
      vi.mocked(isClaudeCLIAvailable).mockResolvedValue(false)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Manual configuration required'))
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Stored configuration for claude-server'))
    })
    
    it('should fallback to registry when no stored configuration exists', async () => {
      // Mock ConfigManager methods to simulate the fallback scenario
      const configManager = ConfigManager.getInstance()
      vi.spyOn(configManager, 'isUsingProjectConfig').mockResolvedValue(false)
      vi.spyOn(configManager, 'getConfigLocation').mockResolvedValue(path.join(testDir, '.bwc', 'config.json'))
      vi.spyOn(configManager, 'getAllDependencies').mockResolvedValue({
        subagents: [],
        commands: [],
        mcpServers: ['registry-server']
      })
      vi.spyOn(configManager, 'getAllMCPServerConfigs').mockResolvedValue({}) // No stored config
      
      // Mock the registry to return the server info
      mockRegistryClient.findMCPServer.mockResolvedValue({
        name: 'registry-server',
        display_name: 'Registry Server',
        description: 'Test Server',
        verification: { status: 'verified' },
        installation_methods: [{
          type: 'claude-cli',
          recommended: true,
          config_example: '{}'
        }],
        user_inputs: []
      })
      
      const { installMCPServer, configureInClaudeCode } = await import('../../../src/utils/mcp-installer')
      vi.mocked(installMCPServer).mockResolvedValue(undefined)
      vi.mocked(configureInClaudeCode).mockResolvedValue(undefined)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockRegistryClient.findMCPServer).toHaveBeenCalledWith('registry-server')
      expect(installMCPServer).toHaveBeenCalled()
      expect(configureInClaudeCode).toHaveBeenCalled()
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Installed MCP server: registry-server')
    })
    
    it('should handle SSE/HTTP transport type', async () => {
      // Create config with SSE MCP server
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
          mcpServers: {
            'sse-server': {
              provider: 'claude',
              transport: 'sse',
              scope: 'user',
              url: 'https://api.example.com/sse',
              headers: {
                'Authorization': 'Bearer token123'
              }
            }
          }
        }
      })
      
      vi.mocked(isClaudeCLIAvailable).mockResolvedValue(true)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      const expectedArgs = expect.arrayContaining([
        'mcp', 'add',
        '--scope', 'user',
        '--transport', 'sse',
        '--header', 'Authorization: Bearer token123',
        'sse-server',
        'https://api.example.com/sse'
      ])
      
      expect(execClaudeCLI).toHaveBeenCalledWith(expectedArgs)
    })
    
    it('should update .mcp.json for project scope servers', async () => {
      // Create config with project scope MCP server
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
          mcpServers: {
            'project-server': {
              provider: 'claude',
              transport: 'stdio',
              scope: 'project',
              command: 'test-command',
              args: ['arg1'],
              env: { KEY: 'value' }
            }
          }
        }
      })
      
      vi.mocked(isClaudeCLIAvailable).mockResolvedValue(true)
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      const { addServerToMCPJson } = await import('../../../src/utils/mcp-json')
      expect(addServerToMCPJson).toHaveBeenCalled()
    })
  })
  
  describe('project vs user configuration', () => {
    it('should detect project configuration', async () => {
      // Create project config with at least one dependency so it doesn't exit early
      await fs.writeJson(path.join(testDir, 'bwc.config.json'), {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '.claude/agents/',
          commands: '.claude/commands/'
        },
        installed: {
          subagents: ['test-agent'],
          commands: [],
          mcpServers: {}
        }
      })
      
      // Mock registry to find the subagent
      mockRegistryClient.findSubagent.mockResolvedValue({
        name: 'test-agent',
        description: 'Test Agent',
        file: 'https://example.com/test-agent.md'
      })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('bwc.config.json'))
      expect(logger.success).toHaveBeenCalledWith('Installation complete!')
    })
    
    it('should use user configuration when no project config exists', async () => {
      // Create user config only
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '~/.claude/agents',
          commands: '~/.claude/commands'
        },
        installed: {
          subagents: [],
          commands: [],
          mcpServers: {}
        }
      })
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('.bwc/config.json'))
    })
  })
  
  describe('error handling', () => {
    it('should handle errors during subagent installation', async () => {
      // Create config with subagent
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
          subagents: ['error-agent'],
          commands: [],
          mcpServers: {}
        }
      })
      
      mockRegistryClient.findSubagent.mockRejectedValue(new Error('Network error'))
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Failed to install subagent: error-agent')
      expect(logger.error).toHaveBeenCalledWith('Network error')
    })
    
    it('should handle errors during MCP server installation', async () => {
      // Create config with MCP server
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
          mcpServers: {
            'error-server': {
              provider: 'claude',
              transport: 'stdio',
              scope: 'local'
            }
          }
        }
      })
      
      vi.mocked(isClaudeCLIAvailable).mockResolvedValue(true)
      vi.mocked(execClaudeCLI).mockRejectedValue(new Error('Claude CLI error'))
      
      const command = createInstallCommand()
      await command.parseAsync(['node', 'test'])
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Failed to install MCP server: error-server')
      expect(logger.error).toHaveBeenCalledWith('Claude CLI error')
    })
  })
})