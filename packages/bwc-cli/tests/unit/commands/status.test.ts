import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStatusCommand } from '../../../src/commands/status'
import { ConfigManager } from '../../../src/config/manager'
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
    dockerInstalled: true,
    mcpToolkitAvailable: true,
    gatewayConfigured: true
  })),
  listInstalledDockerMCPServers: vi.fn(() => Promise.resolve(['test-server']))
}))

// Mock claude-cli utilities
vi.mock('../../../src/utils/claude-cli', () => ({
  execClaudeCLI: vi.fn(() => Promise.resolve({
    stdout: '',
    stderr: 'command not found'
  }))
}))

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn((cmd: string) => {
    if (cmd === 'docker') {
      return Promise.resolve({ stdout: 'Docker version 27.1.1, build 1234567' })
    }
    return Promise.reject(new Error('Command not found'))
  })
}))

// Mock console.log for cleaner test output
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
})
afterEach(() => {
  console.log = originalConsoleLog
})

describe('status command', () => {
  let testDir: string
  let originalCwd: () => string
  let originalExit: typeof process.exit
  
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
  
  describe('configuration detection', () => {
    it('should detect project configuration when present', async () => {
      // Create project config
      const projectConfig = {
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
      }
      await fs.writeJson(path.join(testDir, 'bwc.config.json'), projectConfig)
      
      // Create user config
      const userConfigPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(userConfigPath))
      await fs.writeJson(userConfigPath, {
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
      
      const command = createStatusCommand()
      
      // Parse with JSON output to check results
      await command.parseAsync(['node', 'test', '--json'])
      
      // Check that JSON was output with correct scope
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(report.configScope.active).toBe('project')
      expect(report.configScope.projectConfig.exists).toBe(true)
      expect(report.configScope.userConfig.exists).toBe(true)
    })
    
  })
  
  describe('MCP server scope display', () => {
    it('should display MCP server scopes correctly', async () => {
      // Create config with MCP servers
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
          mcpServers: {
            'local-server': {
              scope: 'local',
              provider: 'docker',
              transport: 'stdio',
              verificationStatus: 'verified'
            },
            'user-server': {
              scope: 'user',
              provider: 'claude',
              transport: 'sse',
              verificationStatus: 'community'
            },
            'project-server': {
              scope: 'project',
              provider: 'claude',
              transport: 'http',
              verificationStatus: 'experimental'
            }
          }
        }
      })
      
      const command = createStatusCommand()
      
      // Parse with JSON output
      await command.parseAsync(['node', 'test', '--json'])
      
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(report.installed.mcpServers['local-server'].scope).toBe('local')
      expect(report.installed.mcpServers['user-server'].scope).toBe('user')
      expect(report.installed.mcpServers['project-server'].scope).toBe('project')
    })
    
    it('should filter MCP servers by scope when --scope option is used', async () => {
      // Create config with MCP servers
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
          mcpServers: {
            'local-server': {
              scope: 'local',
              provider: 'docker',
              transport: 'stdio'
            },
            'user-server': {
              scope: 'user',
              provider: 'claude',
              transport: 'sse'
            }
          }
        }
      })
      
      const command = createStatusCommand()
      
      // Parse with scope filter
      await command.parseAsync(['node', 'test', '--json', '--scope', 'local'])
      
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(Object.keys(report.installed.mcpServers)).toHaveLength(1)
      expect(report.installed.mcpServers['local-server']).toBeDefined()
      expect(report.installed.mcpServers['user-server']).toBeUndefined()
    })
  })
  
  describe('health checks', () => {
    it('should report configuration and path issues', async () => {
      // Create config with non-existent paths
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '/non/existent/path',
          commands: '/another/non/existent'
        },
        installed: {
          subagents: [],
          commands: [],
          mcpServers: {}
        }
      })
      
      const command = createStatusCommand()
      
      // Parse with JSON output
      await command.parseAsync(['node', 'test', '--json'])
      
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(report.health.pathsAccessible).toBe(false)
      expect(report.health.issues).toHaveLength(2)
      expect(report.health.issues[0]).toContain('Subagents path does not exist')
      expect(report.health.issues[1]).toContain('Commands path does not exist')
    })
  })
  
  describe('Docker and Claude CLI status', () => {
    it('should report Docker MCP status correctly', async () => {
      // Create minimal config
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
      
      const command = createStatusCommand()
      
      // Parse with JSON output
      await command.parseAsync(['node', 'test', '--json'])
      
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(report.dockerMCP.dockerInstalled).toBe(true)
      expect(report.dockerMCP.dockerVersion).toBe('27.1.1')
      expect(report.dockerMCP.gatewayRunning).toBe(true)
      expect(report.dockerMCP.installedServers).toContain('test-server')
    })
    
    it('should report Claude CLI as not available', async () => {
      // Create minimal config
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
      
      const command = createStatusCommand()
      
      // Parse with JSON output
      await command.parseAsync(['node', 'test', '--json'])
      
      const jsonOutput = (console.log as any).mock.calls[0][0]
      const report = JSON.parse(jsonOutput)
      
      expect(report.claudeCLI.available).toBe(false)
    })
  })
  
  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      // Create minimal config first
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
      
      const command = createStatusCommand()
      
      // Mock ConfigManager.getInstance to throw an error
      vi.spyOn(ConfigManager, 'getInstance').mockImplementation(() => {
        throw new Error('Test error')
      })
      
      // Try to get status
      await command.parseAsync(['node', 'test'])
      
      // Check that error was handled
      expect(logger.error).toHaveBeenCalledWith('Test error')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
  })
})