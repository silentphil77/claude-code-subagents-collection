import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  checkDockerMCPStatus,
  setupDockerMCPGateway,
  enableDockerMCPServer,
  disableDockerMCPServer,
  getDockerMCPServerInfo,
  listAvailableDockerMCPServers,
  listInstalledDockerMCPServers,
  isDockerMCPAvailable
} from '../../../src/utils/docker-mcp'
import { execa } from 'execa'
import { existsSync } from 'fs'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn()
}))

// Mock fs  
vi.mock('fs', () => ({
  existsSync: vi.fn()
}))

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    readJSON: vi.fn(),
    writeJSON: vi.fn(),
    ensureDir: vi.fn()
  },
  readJSON: vi.fn(),
  writeJSON: vi.fn(),
  ensureDir: vi.fn()
}))

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn()
  }
}))

// Mock Claude CLI
vi.mock('../../../src/utils/claude-cli', () => ({
  execClaudeCLI: vi.fn()
}))

describe('Docker MCP Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('checkDockerMCPStatus', () => {
    it('should detect when Docker is installed and configured', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      
      vi.mocked(execa)
        .mockResolvedValueOnce({ stdout: 'Docker version 27.1.1', stderr: '', exitCode: 0 } as any) // isDockerAvailable
        .mockResolvedValueOnce({ stdout: 'mcp version 1.0.0', stderr: '', exitCode: 0 } as any) // isDockerMCPAvailable
        .mockResolvedValueOnce({ stdout: 'server1,server2', stderr: '', exitCode: 0 } as any) // listInstalledDockerMCPServers
      
      vi.mocked(execClaudeCLI).mockResolvedValue({ stdout: 'Docker MCP toolkit: Connected', stderr: '', exitCode: 0 } as any)
      
      const status = await checkDockerMCPStatus()
      
      expect(status.dockerInstalled).toBe(true)
      expect(status.mcpToolkitAvailable).toBe(true)
      expect(status.gatewayConfigured).toBe(true)
      expect(status.installedServers).toEqual(['server1', 'server2'])
    })
    
    it('should detect when Docker is not installed', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      
      vi.mocked(execa).mockRejectedValue(new Error('Command not found'))
      vi.mocked(execClaudeCLI).mockRejectedValue(new Error('Docker not available'))
      
      const status = await checkDockerMCPStatus()
      
      expect(status.dockerInstalled).toBe(false)
      expect(status.mcpToolkitAvailable).toBe(false)
      expect(status.gatewayConfigured).toBe(false)
    })
    
    it('should detect when MCP toolkit is not available', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      
      vi.mocked(execa)
        .mockResolvedValueOnce({ stdout: 'Docker version 27.1.1', stderr: '', exitCode: 0 } as any)
        .mockRejectedValue(new Error('unknown shorthand flag: -v'))
      
      vi.mocked(execClaudeCLI).mockRejectedValue(new Error('MCP not configured'))
      
      const status = await checkDockerMCPStatus()
      
      expect(status.dockerInstalled).toBe(true)
      expect(status.mcpToolkitAvailable).toBe(false)
      expect(status.gatewayConfigured).toBe(false)
    })
    
    it('should detect when gateway is not configured', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      
      vi.mocked(execa)
        .mockResolvedValueOnce({ stdout: 'Docker version 27.1.1', stderr: '', exitCode: 0 } as any)
        .mockResolvedValueOnce({ stdout: 'mcp version 1.0.0', stderr: '', exitCode: 0 } as any)
        .mockResolvedValueOnce({ stdout: '', stderr: '', exitCode: 0 } as any) // empty installed servers
      
      vi.mocked(execClaudeCLI).mockRejectedValue(new Error('Server not found'))
      
      const status = await checkDockerMCPStatus()
      
      expect(status.dockerInstalled).toBe(true)
      expect(status.mcpToolkitAvailable).toBe(true)
      expect(status.gatewayConfigured).toBe(false)
    })
  })
  
  describe('setupDockerMCPGateway', () => {
    it('should setup gateway for local scope', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      const { logger } = await import('../../../src/utils/logger')
      
      vi.mocked(execClaudeCLI).mockResolvedValue({ stdout: 'Gateway configured', stderr: '', exitCode: 0 } as any)
      
      await setupDockerMCPGateway('local')
      
      expect(execClaudeCLI).toHaveBeenCalledWith([
        'mcp', 'add',
        'docker-toolkit',
        '--scope', 'local',
        '--',
        'docker', 'mcp', 'gateway', 'run'
      ])
      expect(logger.success).toHaveBeenCalledWith('Docker MCP gateway configured in Claude Code')
    })
    
    it('should setup gateway for project scope', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      const { logger } = await import('../../../src/utils/logger')
      
      vi.mocked(execClaudeCLI).mockResolvedValue({ stdout: 'Gateway configured', stderr: '', exitCode: 0 } as any)
      
      await setupDockerMCPGateway('project')
      
      expect(execClaudeCLI).toHaveBeenCalledWith([
        'mcp', 'add',
        'docker-toolkit',
        '--scope', 'project',
        '--',
        'docker', 'mcp', 'gateway', 'run'
      ])
      expect(logger.success).toHaveBeenCalledWith('Docker MCP gateway configured in Claude Code')
    })
    
    it('should setup gateway for user scope', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      const { logger } = await import('../../../src/utils/logger')
      
      vi.mocked(execClaudeCLI).mockResolvedValue({ stdout: 'Gateway configured', stderr: '', exitCode: 0 } as any)
      
      await setupDockerMCPGateway('user')
      
      expect(execClaudeCLI).toHaveBeenCalledWith([
        'mcp', 'add',
        'docker-toolkit',
        '--scope', 'user',
        '--',
        'docker', 'mcp', 'gateway', 'run'
      ])
      expect(logger.success).toHaveBeenCalledWith('Docker MCP gateway configured in Claude Code')
    })
    
    it('should handle Claude CLI errors', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      
      vi.mocked(execClaudeCLI).mockRejectedValue(new Error('Claude CLI error'))
      
      await expect(setupDockerMCPGateway('local')).rejects.toThrow('Failed to setup Docker MCP gateway: Claude CLI error')
    })
    
    it('should use default project scope', async () => {
      const { execClaudeCLI } = await import('../../../src/utils/claude-cli')
      const { logger } = await import('../../../src/utils/logger')
      
      vi.mocked(execClaudeCLI).mockResolvedValue({ stdout: 'Gateway configured', stderr: '', exitCode: 0 } as any)
      
      await setupDockerMCPGateway() // No scope provided, should default to 'project'
      
      expect(execClaudeCLI).toHaveBeenCalledWith([
        'mcp', 'add',
        'docker-toolkit',
        '--scope', 'project',
        '--',
        'docker', 'mcp', 'gateway', 'run'
      ])
      expect(logger.success).toHaveBeenCalledWith('Docker MCP gateway configured in Claude Code')
    })
  })
  
  describe('enableDockerMCPServer', () => {
    it('should enable a server successfully', async () => {
      vi.mocked(execa)
        .mockResolvedValueOnce({ stdout: 'Server enabled', stderr: '', exitCode: 0 } as any) // Enable command
        .mockResolvedValueOnce({ stdout: 'test-server,other-server', stderr: '', exitCode: 0 } as any) // List command
      
      await enableDockerMCPServer('test-server')
      
      const { logger } = await import('../../../src/utils/logger')
      
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'server', 'enable', 'test-server'])
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'server', 'list'])
      expect(logger.success).toHaveBeenCalledWith('Server "test-server" enabled in Docker MCP Toolkit')
    })
    
    it('should handle errors when enabling server', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Docker error'))
      
      await expect(enableDockerMCPServer('test-server')).rejects.toThrow('Failed to enable server "test-server": Docker error')
    })
  })
  
  describe('disableDockerMCPServer', () => {
    it('should disable a server successfully', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'Server disabled', stderr: '', exitCode: 0 } as any)
      
      await disableDockerMCPServer('test-server')
      
      const { logger } = await import('../../../src/utils/logger')
      
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'server', 'disable', 'test-server'])
      expect(logger.success).toHaveBeenCalledWith('Server "test-server" disabled in Docker MCP Toolkit')
    })
    
    it('should handle errors when disabling server', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Docker error'))
      
      await expect(disableDockerMCPServer('test-server')).rejects.toThrow('Failed to disable server "test-server": Docker error')
    })
  })
  
  describe('getDockerMCPServerInfo', () => {
    it('should get server information', async () => {
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'test-server: A test server for MCP', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const info = await getDockerMCPServerInfo('test-server')
      
      expect(info).toBe('A test server for MCP')
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'catalog', 'show'])
    })
    
    it('should return null for non-existent server', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any)
      
      const info = await getDockerMCPServerInfo('non-existent')
      
      expect(info).toBeNull()
    })
    
    it('should handle errors when getting server info', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Docker error'))
      
      const info = await getDockerMCPServerInfo('test-server')
      
      expect(info).toBeNull()
    })
  })
  
  describe('listAvailableDockerMCPServers', () => {
    it('should list available servers', async () => {
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'server1: Description 1\nserver2: Description 2\nserver3: Description 3', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const servers = await listAvailableDockerMCPServers()
      
      expect(servers).toEqual(['server1', 'server2', 'server3'])
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'catalog', 'show'])
    })
    
    it('should return empty array when no servers available', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any)
      
      const servers = await listAvailableDockerMCPServers()
      
      expect(servers).toEqual([])
    })
    
    it('should handle errors when listing servers', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Docker error'))
      
      const servers = await listAvailableDockerMCPServers()
      
      expect(servers).toEqual([])
    })
  })
  
  describe('listInstalledDockerMCPServers', () => {
    it('should list installed servers', async () => {
      vi.mocked(execa).mockResolvedValue({ 
        stdout: 'server1,server2', 
        stderr: '', 
        exitCode: 0 
      } as any)
      
      const servers = await listInstalledDockerMCPServers()
      
      expect(servers).toEqual(['server1', 'server2'])
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', 'server', 'list'])
    })
    
    it('should return empty array when no servers installed', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any)
      
      const servers = await listInstalledDockerMCPServers()
      
      expect(servers).toEqual([])
    })
    
    it('should handle errors when listing installed servers', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Docker error'))
      
      const servers = await listInstalledDockerMCPServers()
      
      expect(servers).toEqual([])
    })
  })
  
  describe('isDockerMCPAvailable', () => {
    it('should return true when Docker and MCP toolkit are available', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'mcp version 1.0.0', stderr: '', exitCode: 0 } as any)
      
      const available = await isDockerMCPAvailable()
      
      expect(available).toBe(true)
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', '--version'])
    })
    
    it('should return false when Docker is not installed', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Command not found'))
      
      const available = await isDockerMCPAvailable()
      
      expect(available).toBe(false)
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', '--version'])
    })
    
    it('should return false when MCP toolkit is not available', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('unknown shorthand flag: -v'))
      
      const available = await isDockerMCPAvailable()
      
      expect(available).toBe(false)
      expect(execa).toHaveBeenCalledWith('docker', ['mcp', '--version'])
    })
  })
})