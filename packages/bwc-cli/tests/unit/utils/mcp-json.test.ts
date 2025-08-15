import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  readMCPJson,
  writeMCPJson,
  addServerToMCPJson,
  removeServerFromMCPJson,
  serverExistsInMCPJson
} from '../../../src/utils/mcp-json'
import { createTestDir, cleanupTestDir } from '../../helpers/test-utils'
import * as fs from 'fs-extra'
import path from 'path'

describe('MCP JSON utilities', () => {
  let testDir: string
  let originalCwd: () => string
  
  beforeEach(async () => {
    testDir = await createTestDir()
    originalCwd = process.cwd
    process.cwd = () => testDir
  })
  
  afterEach(async () => {
    process.cwd = originalCwd
    // Small delay to ensure file operations complete
    await new Promise(resolve => setTimeout(resolve, 10))
    await cleanupTestDir(testDir)
  })
  
  describe('readMCPJson', () => {
    it('should read existing .mcp.json file', async () => {
      const mcpConfig = {
        mcpServers: {
          'test-server': {
            command: 'npx',
            args: ['test-server'],
            env: { TEST: 'value' }
          }
        }
      }
      
      await fs.writeJson(path.join(testDir, '.mcp.json'), mcpConfig)
      
      const result = await readMCPJson()
      expect(result).toEqual(mcpConfig)
    })
    
    it('should return null if .mcp.json does not exist', async () => {
      const result = await readMCPJson()
      expect(result).toBeNull()
    })
    
    it('should handle invalid JSON gracefully', async () => {
      await fs.writeFile(path.join(testDir, '.mcp.json'), 'invalid json')
      
      await expect(readMCPJson()).rejects.toThrow()
    })
  })
  
  describe('writeMCPJson', () => {
    it('should write .mcp.json file', async () => {
      const config = {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['server.js']
          }
        }
      }
      
      await writeMCPJson(config)
      
      const written = await fs.readJson(path.join(testDir, '.mcp.json'))
      expect(written).toEqual(config)
    })
    
    it('should overwrite existing .mcp.json', async () => {
      const initial = {
        mcpServers: {
          'old-server': { command: 'old' }
        }
      }
      const updated = {
        mcpServers: {
          'new-server': { command: 'new' }
        }
      }
      
      await fs.writeJson(path.join(testDir, '.mcp.json'), initial)
      await writeMCPJson(updated)
      
      const result = await fs.readJson(path.join(testDir, '.mcp.json'))
      expect(result).toEqual(updated)
    })
  })
  
  describe('addServerToMCPJson', () => {
    it('should add server to new .mcp.json', async () => {
      const server = {
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test server',
        verification: { status: 'verified' as const }
      }
      
      const configExample = JSON.stringify({
        mcpServers: {
          'test-server': {
            command: 'npx',
            args: ['test-server']
          }
        }
      })
      
      await addServerToMCPJson(server, configExample, [])
      
      const result = await readMCPJson()
      expect(result?.mcpServers['test-server']).toBeDefined()
      expect(result?.mcpServers['test-server'].command).toBe('npx')
    })
    
    it('should add environment variables', async () => {
      const server = {
        name: 'db-server',
        display_name: 'Database Server',
        description: 'Database server',
        verification: { status: 'verified' as const }
      }
      
      const configExample = JSON.stringify({
        mcpServers: {
          'db-server': {
            command: 'node',
            args: ['db.js']
          }
        }
      })
      
      const envVars = ['DB_HOST=localhost', 'DB_PORT=5432']
      
      await addServerToMCPJson(server, configExample, envVars)
      
      const result = await readMCPJson()
      expect(result?.mcpServers['db-server'].env).toEqual({
        DB_HOST: '${DB_HOST:-localhost}',
        DB_PORT: '${DB_PORT:-5432}'
      })
    })
    
    it('should merge with existing servers', async () => {
      // Create initial config
      await writeMCPJson({
        mcpServers: {
          'existing-server': {
            command: 'existing',
            args: []
          }
        }
      })
      
      const newServer = {
        name: 'new-server',
        display_name: 'New Server',
        description: 'New server',
        verification: { status: 'community' as const }
      }
      
      const configExample = JSON.stringify({
        mcpServers: {
          'new-server': {
            command: 'new',
            args: ['--flag']
          }
        }
      })
      
      await addServerToMCPJson(newServer, configExample, [])
      
      const result = await readMCPJson()
      expect(Object.keys(result?.mcpServers || {})).toHaveLength(2)
      expect(result?.mcpServers['existing-server']).toBeDefined()
      expect(result?.mcpServers['new-server']).toBeDefined()
    })
    
    it('should handle environment variable expansion', async () => {
      const server = {
        name: 'api-server',
        display_name: 'API Server',
        description: 'API server',
        verification: { status: 'verified' as const }
      }
      
      const configExample = JSON.stringify({
        mcpServers: {
          'api-server': {
            command: 'node',
            args: ['api.js']
          }
        }
      })
      
      const envVars = ['API_KEY=$SECRET_KEY', 'API_URL=https://api.example.com']
      
      await addServerToMCPJson(server, configExample, envVars)
      
      const result = await readMCPJson()
      expect(result?.mcpServers['api-server'].env?.API_KEY).toBe('$SECRET_KEY')
      expect(result?.mcpServers['api-server'].env?.API_URL).toBe('${API_URL:-https://api.example.com}')
    })
  })
  
  describe('serverExistsInMCPJson', () => {
    it('should return true if server exists', async () => {
      await writeMCPJson({
        mcpServers: {
          'test-server': {
            command: 'test'
          }
        }
      })
      
      const exists = await serverExistsInMCPJson('test-server')
      expect(exists).toBe(true)
    })
    
    it('should return false if server does not exist', async () => {
      await writeMCPJson({
        mcpServers: {
          'other-server': {
            command: 'other'
          }
        }
      })
      
      const exists = await serverExistsInMCPJson('test-server')
      expect(exists).toBe(false)
    })
    
    it('should return false if .mcp.json does not exist', async () => {
      const exists = await serverExistsInMCPJson('any-server')
      expect(exists).toBe(false)
    })
  })
  
  describe('removeServerFromMCPJson', () => {
    it('should remove existing server', async () => {
      await writeMCPJson({
        mcpServers: {
          'server1': { command: 'cmd1' },
          'server2': { command: 'cmd2' },
          'server3': { command: 'cmd3' }
        }
      })
      
      const removed = await removeServerFromMCPJson('server2')
      expect(removed).toBe(true)
      
      const result = await readMCPJson()
      expect(Object.keys(result?.mcpServers || {})).toHaveLength(2)
      expect(result?.mcpServers['server2']).toBeUndefined()
    })
    
    it('should return false if server does not exist', async () => {
      await writeMCPJson({
        mcpServers: {
          'server1': { command: 'cmd1' }
        }
      })
      
      const removed = await removeServerFromMCPJson('nonexistent')
      expect(removed).toBe(false)
    })
    
    it('should return false if .mcp.json does not exist', async () => {
      const removed = await removeServerFromMCPJson('any-server')
      expect(removed).toBe(false)
    })
  })
  
  describe('edge cases', () => {
    it('should handle servers with special characters in names', async () => {
      const server = {
        name: '@scope/server-name',
        display_name: 'Scoped Server',
        description: 'Server with scope',
        verification: { status: 'verified' as const }
      }
      
      const configExample = JSON.stringify({
        mcpServers: {
          '@scope/server-name': {
            command: 'npx',
            args: ['@scope/server-name']
          }
        }
      })
      
      await addServerToMCPJson(server, configExample, [])
      
      const result = await readMCPJson()
      expect(result?.mcpServers['@scope/server-name']).toBeDefined()
    })
    
    it('should handle deeply nested configurations', async () => {
      const server = {
        name: 'complex-server',
        display_name: 'Complex Server',
        description: 'Complex server',
        verification: { status: 'experimental' as const }
      }
      
      const configExample = {
        mcpServers: {
          'complex-server': {
            command: 'node',
            args: ['--inspect', '--experimental', 'server.js'],
            env: {
              NODE_ENV: 'production',
              CONFIG: JSON.stringify({ nested: { deep: 'value' } })
            }
          }
        }
      }
      
      await addServerToMCPJson(server, JSON.stringify(configExample), [])
      
      const result = await readMCPJson()
      expect(result?.mcpServers['complex-server'].env?.CONFIG).toBeDefined()
    })
  })
})