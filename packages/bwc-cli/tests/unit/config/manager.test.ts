import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConfigManager } from '../../../src/config/manager'
import { MCPServerConfig } from '../../../src/registry/types'
import * as fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { createTestDir, cleanupTestDir, createTestConfig } from '../../helpers/test-utils'

describe('ConfigManager', () => {
  let testDir: string
  let configManager: ConfigManager
  let originalEnv: NodeJS.ProcessEnv
  
  beforeEach(async () => {
    testDir = await createTestDir()
    originalEnv = { ...process.env }
    
    // Set test environment variables
    process.env.BWC_TEST_HOME = testDir
    process.env.BWC_CONFIG_PATH = path.join(testDir, '.bwc', 'config.json')
    
    // Reset singleton instance
    ConfigManager.resetInstance()
    configManager = ConfigManager.getInstance()
  })
  
  afterEach(async () => {
    // Reset singleton before cleanup
    ConfigManager.resetInstance()
    
    // Restore environment
    process.env = originalEnv
    
    // Clean up test directory
    await cleanupTestDir(testDir)
  })
  
  describe('initialization', () => {
    it('should initialize user config', async () => {
      await configManager.init()
      
      const config = await configManager.load()
      expect(config.version).toBe('1.0')
      expect(config.registry).toBe('https://buildwithclaude.com/registry.json')
      expect(config.installed.subagents).toEqual([])
      expect(config.installed.commands).toEqual([])
    })
    
    it('should initialize project config', async () => {
      process.cwd = () => testDir
      
      await configManager.init({ project: true })
      
      const configPath = path.join(testDir, 'bwc.config.json')
      const exists = await fs.pathExists(configPath)
      expect(exists).toBe(true)
      
      const config = await fs.readJson(configPath)
      expect(config.paths.subagents).toBe('.claude/agents/')
      expect(config.paths.commands).toBe('.claude/commands/')
    })
    
    it('should throw error if config already exists without force', async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir)
      
      await expect(configManager.init({ project: true })).rejects.toThrow(
        'Project configuration already exists'
      )
    })
    
    it('should overwrite config with force flag', async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir, { version: '0.9' })
      
      await configManager.init({ project: true, force: true })
      
      const config = await fs.readJson(path.join(testDir, 'bwc.config.json'))
      expect(config.version).toBe('1.0')
    })
  })
  
  describe('config loading', () => {
    it('should load project config when available', async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir, {
        version: '1.0',
        installed: {
          subagents: ['test-agent'],
          commands: ['test-command'],
          mcpServers: {}
        }
      })
      
      const config = await configManager.load()
      expect(config.installed.subagents).toContain('test-agent')
      expect(config.installed.commands).toContain('test-command')
    })
    
    it('should find project config in parent directories', async () => {
      const subDir = path.join(testDir, 'sub', 'directory')
      await fs.ensureDir(subDir)
      await createTestConfig(testDir, {
        installed: { subagents: ['parent-agent'] }
      })
      
      process.cwd = () => subDir
      
      const config = await configManager.load()
      expect(config.installed.subagents).toContain('parent-agent')
    })
    
    it('should force load user config when requested', async () => {
      process.cwd = () => testDir
      
      // Create project config
      await createTestConfig(testDir, {
        installed: { subagents: ['project-agent'], commands: [], mcpServers: {} }
      })
      
      // Create user config
      const userConfigPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(userConfigPath))
      await fs.writeJson(userConfigPath, {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: { subagents: '.claude/agents/', commands: '.claude/commands/' },
        installed: { subagents: ['user-agent'], commands: [], mcpServers: {} }
      })
      
      const userConfig = await configManager.loadUserConfig()
      expect(userConfig.installed.subagents).toContain('user-agent')
      expect(userConfig.installed.subagents).not.toContain('project-agent')
    })
  })
  
  describe('MCP server configuration', () => {
    beforeEach(async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir)
      await configManager.load()
    })
    
    it('should migrate legacy MCP server format', async () => {
      const legacyConfig = {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: { subagents: '.claude/agents/', commands: '.claude/commands/' },
        installed: {
          subagents: [],
          commands: [],
          mcpServers: ['server1', 'server2', 'server3']
        }
      }
      
      const migrated = await configManager['migrateConfig'](legacyConfig)
      
      expect(migrated.installed.mcpServers).toBeTypeOf('object')
      expect(Object.keys(migrated.installed.mcpServers)).toHaveLength(3)
      
      const server1 = (migrated.installed.mcpServers as any)['server1']
      expect(server1.provider).toBe('docker')
      expect(server1.transport).toBe('stdio')
      expect(server1.scope).toBe('local')
      expect(server1.installedAt).toBeDefined()
    })
    
    it('should add MCP server with full configuration', async () => {
      const serverConfig: MCPServerConfig = {
        provider: 'claude',
        transport: 'sse',
        scope: 'project',
        url: 'https://api.example.com/sse',
        headers: { 'Authorization': 'Bearer token' },
        verificationStatus: 'verified',
        installedAt: new Date().toISOString()
      }
      
      await configManager.addInstalledMCPServer('test-server', serverConfig)
      
      const retrieved = await configManager.getMCPServerConfig('test-server')
      expect(retrieved).toEqual(serverConfig)
    })
    
    it('should handle both old and new MCP server formats', async () => {
      // Start with old format
      await fs.writeJson(path.join(testDir, 'bwc.config.json'), {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: { subagents: '.claude/agents/', commands: '.claude/commands/' },
        installed: {
          subagents: [],
          commands: [],
          mcpServers: ['old-server']
        }
      })
      
      // Force reload
      ConfigManager.resetInstance()
      configManager = ConfigManager.getInstance()
      
      // Add new server
      await configManager.addInstalledMCPServer('new-server', {
        provider: 'claude',
        transport: 'http',
        scope: 'user',
        url: 'https://api.example.com'
      })
      
      const servers = await configManager.getInstalledMCPServers()
      expect(servers).toContain('old-server')
      expect(servers).toContain('new-server')
    })
    
    it('should remove MCP server from both formats', async () => {
      await configManager.addInstalledMCPServer('server1', {
        provider: 'docker',
        transport: 'stdio',
        scope: 'local'
      })
      await configManager.addInstalledMCPServer('server2', {
        provider: 'claude',
        transport: 'sse',
        scope: 'project'
      })
      
      await configManager.removeInstalledMCPServer('server1')
      
      const servers = await configManager.getInstalledMCPServers()
      expect(servers).not.toContain('server1')
      expect(servers).toContain('server2')
    })
    
    it('should get all MCP server configurations', async () => {
      const config1: MCPServerConfig = {
        provider: 'docker',
        transport: 'stdio',
        scope: 'local'
      }
      const config2: MCPServerConfig = {
        provider: 'claude',
        transport: 'http',
        scope: 'project',
        url: 'https://api.example.com'
      }
      
      await configManager.addInstalledMCPServer('server1', config1)
      await configManager.addInstalledMCPServer('server2', config2)
      
      const allConfigs = await configManager.getAllMCPServerConfigs()
      
      expect(Object.keys(allConfigs)).toHaveLength(2)
      expect(allConfigs['server1'].provider).toBe('docker')
      expect(allConfigs['server2'].provider).toBe('claude')
    })
  })
  
  describe('subagents and commands', () => {
    beforeEach(async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir)
      await configManager.load()
    })
    
    it('should add and remove subagents', async () => {
      await configManager.addInstalledSubagent('agent1')
      await configManager.addInstalledSubagent('agent2')
      
      let agents = await configManager.getInstalledSubagents()
      expect(agents).toEqual(['agent1', 'agent2'])
      
      await configManager.removeInstalledSubagent('agent1')
      
      agents = await configManager.getInstalledSubagents()
      expect(agents).toEqual(['agent2'])
    })
    
    it('should not add duplicate subagents', async () => {
      await configManager.addInstalledSubagent('agent1')
      await configManager.addInstalledSubagent('agent1')
      
      const agents = await configManager.getInstalledSubagents()
      expect(agents).toEqual(['agent1'])
    })
    
    it('should add and remove commands', async () => {
      await configManager.addInstalledCommand('cmd1')
      await configManager.addInstalledCommand('cmd2')
      
      let commands = await configManager.getInstalledCommands()
      expect(commands).toEqual(['cmd1', 'cmd2'])
      
      await configManager.removeInstalledCommand('cmd1')
      
      commands = await configManager.getInstalledCommands()
      expect(commands).toEqual(['cmd2'])
    })
  })
  
  describe('path resolution', () => {
    it('should resolve project-relative paths', async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir, {
        paths: {
          subagents: './custom/agents',
          commands: './custom/commands'
        }
      })
      
      const subagentsPath = await configManager.getSubagentsPath()
      expect(subagentsPath).toBe(path.join(testDir, 'custom/agents'))
      
      const commandsPath = await configManager.getCommandsPath()
      expect(commandsPath).toBe(path.join(testDir, 'custom/commands'))
    })
    
    it('should expand tilde in paths', async () => {
      process.cwd = () => path.join(testDir, 'project')
      
      // Create config with tilde paths
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, {
        version: '1.0',
        registry: 'https://buildwithclaude.com/registry.json',
        paths: {
          subagents: '~/.claude/agents',
          commands: '~/.claude/commands'
        },
        installed: { subagents: [], commands: [], mcpServers: {} }
      })
      
      // Force reload to pick up the config
      ConfigManager.resetInstance()
      configManager = ConfigManager.getInstance()
      
      const subagentsPath = await configManager.getSubagentsPath()
      expect(subagentsPath).toBe(path.join(testDir, '.claude/agents'))
    })
  })
  
  describe('getAllDependencies', () => {
    it('should return all installed items', async () => {
      process.cwd = () => testDir
      await createTestConfig(testDir, {
        installed: {
          subagents: ['agent1', 'agent2'],
          commands: ['cmd1'],
          mcpServers: {
            'server1': { provider: 'docker', transport: 'stdio', scope: 'local' }
          }
        }
      })
      
      const deps = await configManager.getAllDependencies()
      
      expect(deps.subagents).toEqual(['agent1', 'agent2'])
      expect(deps.commands).toEqual(['cmd1'])
      expect(deps.mcpServers).toEqual(['server1'])
    })
  })
  
  describe('config migration', () => {
    it('should migrate from old string array format to new Record format', async () => {
      // Create config with old format
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
          subagents: ['agent1'],
          commands: ['cmd1'],
          mcpServers: ['server1', 'server2', 'server3'] // Old format: string array
        }
      })
      
      const config = await configManager.load()
      
      // Check that migration happened
      expect(typeof config.installed.mcpServers).toBe('object')
      expect(Array.isArray(config.installed.mcpServers)).toBe(false)
      
      const servers = await configManager.getAllMCPServerConfigs()
      expect(servers['server1']).toBeDefined()
      expect(servers['server1'].provider).toBe('docker') // ConfigManager defaults to 'docker' for legacy entries
      expect(servers['server1'].transport).toBe('stdio')
      expect(servers['server1'].scope).toBe('local')
      
      expect(servers['server2']).toBeDefined()
      expect(servers['server3']).toBeDefined()
    })
    
    it('should handle mixed format during migration', async () => {
      // Create config with partially migrated format
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
            'new-server': {
              provider: 'claude',
              transport: 'stdio',
              scope: 'local'
            },
            'partial-server': 'legacy-value' // Invalid mixed format
          }
        }
      })
      
      const config = await configManager.load()
      
      const servers = await configManager.getAllMCPServerConfigs()
      
      // New format server should be preserved
      expect(servers['new-server'].provider).toBe('claude')
      expect(servers['new-server'].transport).toBe('stdio')
      expect(servers['new-server'].scope).toBe('local')
      
      // Invalid entry should be handled gracefully
      expect(servers['partial-server']).toBeDefined()
    })
    
    it('should preserve existing data during migration', async () => {
      // Create config with old format and existing data
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, {
        version: '1.0',
        registry: 'https://custom-registry.com/registry.json',
        paths: {
          subagents: '/custom/agents',
          commands: '/custom/commands'
        },
        installed: {
          subagents: ['existing-agent1', 'existing-agent2'],
          commands: ['existing-cmd1'],
          mcpServers: ['existing-server1']
        }
      })
      
      const config = await configManager.load()
      
      // Check that existing data is preserved
      expect(config.registry).toBe('https://custom-registry.com/registry.json')
      expect(config.paths.subagents).toBe('/custom/agents')
      expect(config.paths.commands).toBe('/custom/commands')
      expect(config.installed.subagents).toEqual(['existing-agent1', 'existing-agent2'])
      expect(config.installed.commands).toEqual(['existing-cmd1'])
      
      // Check that MCP servers are migrated
      const servers = await configManager.getAllMCPServerConfigs()
      expect(servers['existing-server1']).toBeDefined()
    })
    
    it('should handle empty mcpServers during migration', async () => {
      // Create config with empty mcpServers array
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
          mcpServers: [] // Empty old format
        }
      })
      
      const config = await configManager.load()
      
      // Should be migrated to empty object
      expect(typeof config.installed.mcpServers).toBe('object')
      expect(Object.keys(config.installed.mcpServers)).toHaveLength(0)
    })
    
    it('should not migrate if already in new format', async () => {
      // Create config with new format
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      const originalConfig = {
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
            'server1': {
              provider: 'docker',
              transport: 'stdio',
              scope: 'project',
              installedAt: '2024-01-01T00:00:00Z'
            }
          }
        }
      }
      await fs.writeJson(configPath, originalConfig)
      
      const config = await configManager.load()
      
      // Should not modify the config
      expect(config.installed.mcpServers).toEqual(originalConfig.installed.mcpServers)
    })
    
    it('should save migrated config back to disk', async () => {
      // Create config with old format
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
          mcpServers: ['server1', 'server2']
        }
      })
      
      // Load config (triggers migration)
      await configManager.load()
      
      // Add a new server to trigger save
      await configManager.addInstalledMCPServer('new-server', {
        provider: 'claude',
        transport: 'sse',
        scope: 'user'
      })
      
      // Read the saved config from disk
      const savedConfig = await fs.readJson(configPath)
      
      // Check that the saved format is the new format
      expect(typeof savedConfig.installed.mcpServers).toBe('object')
      expect(savedConfig.installed.mcpServers['server1']).toBeDefined()
      expect(savedConfig.installed.mcpServers['server2']).toBeDefined()
      expect(savedConfig.installed.mcpServers['new-server']).toBeDefined()
      expect(savedConfig.installed.mcpServers['new-server'].provider).toBe('claude')
    })
  })
})