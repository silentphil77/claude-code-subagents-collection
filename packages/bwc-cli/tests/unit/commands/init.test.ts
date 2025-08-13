import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createInitCommand } from '../../../src/commands/init'
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
    code: vi.fn(),
    spinner: vi.fn(() => ({
      succeed: vi.fn(),
      fail: vi.fn()
    }))
  }
}))

describe('init command', () => {
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
    
    // Clear ConfigManager singleton for clean state
    ConfigManager.resetInstance()
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
    vi.restoreAllMocks()
  })
  
  describe('global configuration', () => {
    it('should create global configuration', async () => {
      const command = createInitCommand()
      
      // Parse and execute the command
      await command.parseAsync(['node', 'test'])
      
      // Check that configuration was created
      const configPath = path.join(testDir, '.bwc', 'config.json')
      expect(await fs.pathExists(configPath)).toBe(true)
      
      const config = await fs.readJson(configPath)
      expect(config.version).toBe('1.0')
      expect(config.registry).toBe('https://buildwithclaude.com/registry.json')
      expect(config.installed.subagents).toEqual([])
      expect(config.installed.commands).toEqual([])
    })
    
    it('should fail if configuration already exists', async () => {
      const command = createInitCommand()
      
      // Create existing config
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, { existing: true })
      
      // Try to init again
      await command.parseAsync(['node', 'test'])
      
      // Check that error was logged
      expect(logger.error).toHaveBeenCalledWith('Configuration already exists. Use --force to overwrite.')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
    
    it('should overwrite with --force flag', async () => {
      const command = createInitCommand()
      
      // Create existing config
      const configPath = path.join(testDir, '.bwc', 'config.json')
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeJson(configPath, { existing: true })
      
      // Init with force
      await command.parseAsync(['node', 'test', '--force'])
      
      // Check that configuration was overwritten
      const config = await fs.readJson(configPath)
      expect(config.existing).toBeUndefined()
      expect(config.version).toBe('1.0')
      
      // Check that error was not called
      expect(logger.error).not.toHaveBeenCalled()
      expect(process.exit).not.toHaveBeenCalled()
    })
  })
  
  describe('project configuration', () => {
    it('should create project-level configuration', async () => {
      const command = createInitCommand()
      
      // Parse and execute the command with --project flag
      await command.parseAsync(['node', 'test', '--project'])
      
      // Check that configuration was created in current directory
      const configPath = path.join(testDir, 'bwc.config.json')
      expect(await fs.pathExists(configPath)).toBe(true)
      
      const config = await fs.readJson(configPath)
      expect(config.version).toBe('1.0')
      expect(config.paths.subagents).toBe('.claude/agents/')
      expect(config.paths.commands).toBe('.claude/commands/')
      
      // Check logger calls
      expect(logger.spinner).toHaveBeenCalledWith('Initializing project bwc configuration...')
      expect(logger.info).toHaveBeenCalledWith('Project-level configuration created.')
      expect(logger.info).toHaveBeenCalledWith('Consider adding .claude/ to your .gitignore:')
      expect(logger.code).toHaveBeenCalledWith('echo ".claude/" >> .gitignore')
    })
    
    it('should fail if project configuration already exists', async () => {
      const command = createInitCommand()
      
      // Create existing project config
      const configPath = path.join(testDir, 'bwc.config.json')
      await fs.writeJson(configPath, { existing: true })
      
      // Try to init again
      await command.parseAsync(['node', 'test', '--project'])
      
      // Check that error was logged
      expect(logger.error).toHaveBeenCalledWith('Project configuration already exists. Use --force to overwrite.')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
    
    it('should overwrite project config with --force flag', async () => {
      const command = createInitCommand()
      
      // Create existing project config
      const configPath = path.join(testDir, 'bwc.config.json')
      await fs.writeJson(configPath, { existing: true })
      
      // Init with force
      await command.parseAsync(['node', 'test', '--project', '--force'])
      
      // Check that configuration was overwritten
      const config = await fs.readJson(configPath)
      expect(config.existing).toBeUndefined()
      expect(config.version).toBe('1.0')
      expect(config.paths.subagents).toBe('.claude/agents/')
      
      // Check that error was not called
      expect(logger.error).not.toHaveBeenCalled()
      expect(process.exit).not.toHaveBeenCalled()
    })
  })
  
  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const command = createInitCommand()
      
      // Mock ConfigManager.prototype.init to throw an error
      vi.spyOn(ConfigManager.prototype, 'init').mockRejectedValue(new Error('Test error'))
      
      // Try to init
      await command.parseAsync(['node', 'test'])
      
      // Check that error was handled
      expect(logger.error).toHaveBeenCalledWith('Test error')
      expect(process.exit).toHaveBeenCalledWith(1)
    })
  })
})