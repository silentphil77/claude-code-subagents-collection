import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  findClaudeCLI,
  isClaudeCLIAvailable,
  execClaudeCLI,
  resetClaudePathCache
} from '../../../src/utils/claude-cli'
import { existsSync } from 'fs'
import { execa } from 'execa'
import { homedir } from 'os'
import { join } from 'path'

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn()
}))

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn()
}))

describe('Claude CLI Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetClaudePathCache()
  })
  
  describe('findClaudeCLI', () => {
    it('should find Claude CLI in home directory .claude/local', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      const result = await findClaudeCLI()
      
      expect(result).toBe(expectedPath)
      expect(existsSync).toHaveBeenCalledWith(expectedPath)
    })
    
    it('should find Claude CLI in /usr/local/bin', async () => {
      const expectedPath = '/usr/local/bin/claude'
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      const result = await findClaudeCLI()
      
      expect(result).toBe(expectedPath)
    })
    
    it('should find Claude CLI in homebrew path', async () => {
      const expectedPath = '/opt/homebrew/bin/claude'
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      const result = await findClaudeCLI()
      
      expect(result).toBe(expectedPath)
    })
    
    it('should find Claude CLI using which command', async () => {
      vi.mocked(existsSync).mockImplementation(path => path === '/custom/path/claude')
      vi.mocked(execa).mockResolvedValueOnce({ 
        stdout: '/custom/path/claude', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await findClaudeCLI()
      
      expect(result).toBe('/custom/path/claude')
      expect(execa).toHaveBeenCalledWith('which', ['claude'])
    })
    
    it('should find Claude CLI using command -v', async () => {
      vi.mocked(existsSync).mockImplementation(path => path === '/another/path/claude')
      vi.mocked(execa)
        .mockRejectedValueOnce(new Error('which not found'))
        .mockResolvedValueOnce({ 
          stdout: '/another/path/claude', 
          stderr: '', 
          exitCode: 0 
        } as any)
      
      const result = await findClaudeCLI()
      
      expect(result).toBe('/another/path/claude')
      expect(execa).toHaveBeenCalledWith('sh', ['-c', 'command -v claude'])
    })
    
    it('should throw error when Claude CLI is not found', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(execa).mockRejectedValue(new Error('Command not found'))
      
      await expect(findClaudeCLI()).rejects.toThrow('Claude Code CLI not found')
    })
    
    it('should cache the Claude path after first discovery', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      // First call
      const result1 = await findClaudeCLI()
      expect(result1).toBe(expectedPath)
      expect(existsSync).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      const result2 = await findClaudeCLI()
      expect(result2).toBe(expectedPath)
      expect(existsSync).toHaveBeenCalledTimes(1) // Not called again
    })
    
    it('should reset cache when resetClaudePathCache is called', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      // First call
      await findClaudeCLI()
      expect(existsSync).toHaveBeenCalledTimes(1)
      
      // Reset cache
      resetClaudePathCache()
      
      // Next call should search again
      await findClaudeCLI()
      expect(existsSync).toHaveBeenCalledTimes(2)
    })
  })
  
  describe('isClaudeCLIAvailable', () => {
    it('should return true when Claude CLI is found', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      
      const result = await isClaudeCLIAvailable()
      
      expect(result).toBe(true)
    })
    
    it('should return false when Claude CLI is not found', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(execa).mockRejectedValue(new Error('Command not found'))
      
      const result = await isClaudeCLIAvailable()
      
      expect(result).toBe(false)
    })
  })
  
  describe('execClaudeCLI', () => {
    it('should execute Claude CLI with provided arguments', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: '1.0.77', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await execClaudeCLI(['--version'])
      
      expect(result.stdout).toBe('1.0.77')
      expect(execa).toHaveBeenCalledWith(expectedPath, ['--version'], undefined)
    })
    
    it('should pass options to execa', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'output', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const options = { cwd: '/test/dir' }
      await execClaudeCLI(['mcp', 'list'], options)
      
      expect(execa).toHaveBeenCalledWith(expectedPath, ['mcp', 'list'], options)
    })
    
    it('should handle MCP server installation commands', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'Server installed successfully', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await execClaudeCLI([
        'mcp', 'add',
        '--scope', 'local',
        'test-server',
        '--', 'npx', 'test-server'
      ])
      
      expect(result.stdout).toBe('Server installed successfully')
      expect(execa).toHaveBeenCalledWith(expectedPath, [
        'mcp', 'add',
        '--scope', 'local',
        'test-server',
        '--', 'npx', 'test-server'
      ], undefined)
    })
    
    it('should handle SSE transport configuration', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'SSE server configured', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await execClaudeCLI([
        'mcp', 'add',
        '--scope', 'user',
        '--transport', 'sse',
        '--header', 'Authorization: Bearer token',
        'sse-server',
        'https://api.example.com/sse'
      ])
      
      expect(result.stdout).toBe('SSE server configured')
    })
    
    it('should propagate errors from Claude CLI', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockRejectedValue(new Error('Invalid command'))
      
      await expect(execClaudeCLI(['invalid'])).rejects.toThrow('Invalid command')
    })
    
    it('should throw error when Claude CLI is not found', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(execa).mockRejectedValue(new Error('Command not found'))
      
      await expect(execClaudeCLI(['--version'])).rejects.toThrow('Claude Code CLI not found')
    })
  })
  
  describe('version detection', () => {
    it('should correctly parse version from output', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'Claude CLI version 1.0.77\nBuilt on 2024-01-01', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await execClaudeCLI(['--version'])
      
      expect(result.stdout).toContain('1.0.77')
    })
    
    it('should handle different version output formats', async () => {
      const expectedPath = join(homedir(), '.claude', 'local', 'claude')
      vi.mocked(existsSync).mockImplementation(path => path === expectedPath)
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'v2.1.0', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const result = await execClaudeCLI(['--version'])
      
      expect(result.stdout).toBe('v2.1.0')
    })
  })
})