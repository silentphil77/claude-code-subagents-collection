import { execa, ExecaReturnValue } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Create a temporary test directory
 */
export async function createTestDir(): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), 'bwc-test-' + Date.now())
  await fs.ensureDir(tmpDir)
  return tmpDir
}

/**
 * Clean up a test directory
 */
export async function cleanupTestDir(dir: string): Promise<void> {
  if (dir && dir.includes('bwc-test')) {
    try {
      await fs.remove(dir)
    } catch (error) {
      // Ignore cleanup errors
      console.debug('Failed to cleanup test dir:', error)
    }
  }
}

/**
 * Execute BWC CLI command
 */
export async function runBwc(
  args: string,
  options: { cwd?: string; env?: Record<string, string> } = {}
): Promise<ExecaReturnValue> {
  const bwcPath = path.resolve(__dirname, '../../dist/index.js')
  const defaultEnv = {
    ...process.env,
    BWC_TEST: 'true',
    ...options.env
  }
  
  return execa('node', [bwcPath, ...args.split(' ')], {
    cwd: options.cwd,
    env: defaultEnv,
    reject: false // Don't throw on non-zero exit
  })
}

/**
 * Create a test BWC configuration
 */
export async function createTestConfig(
  dir: string,
  config?: Partial<any>
): Promise<void> {
  const defaultConfig = {
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
    },
    ...config
  }
  
  await fs.writeJson(path.join(dir, 'bwc.config.json'), defaultConfig, { spaces: 2 })
}

/**
 * Create a test MCP JSON configuration
 */
export async function createTestMcpJson(
  dir: string,
  servers: Record<string, any> = {}
): Promise<void> {
  const mcpConfig = {
    mcpServers: servers
  }
  
  await fs.writeJson(path.join(dir, '.mcp.json'), mcpConfig, { spaces: 2 })
}

/**
 * Read JSON file safely
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T | null> {
  try {
    return await fs.readJson(filePath)
  } catch {
    return null
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Create mock subagent file
 */
export async function createMockSubagent(
  dir: string,
  name: string,
  content?: string
): Promise<void> {
  const agentsDir = path.join(dir, '.claude/agents')
  await fs.ensureDir(agentsDir)
  
  const defaultContent = `---
name: ${name}
category: test
tools: [Read, Write]
---

Test subagent content for ${name}
`
  
  await fs.writeFile(
    path.join(agentsDir, `${name}.md`),
    content || defaultContent
  )
}

/**
 * Create mock command file
 */
export async function createMockCommand(
  dir: string,
  name: string,
  content?: string
): Promise<void> {
  const commandsDir = path.join(dir, '.claude/commands')
  await fs.ensureDir(commandsDir)
  
  const defaultContent = `---
name: ${name}
category: test
prefix: /
---

Test command content for ${name}
`
  
  await fs.writeFile(
    path.join(commandsDir, `${name}.md`),
    content || defaultContent
  )
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error('Timeout waiting for condition')
}

/**
 * Create a mock registry response
 */
export function createMockRegistry() {
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    subagents: [
      {
        name: 'test-agent',
        category: 'test',
        description: 'Test subagent',
        version: '1.0.0',
        file: 'subagents/test-agent.md',
        tools: ['Read', 'Write'],
        path: 'subagents/test-agent.md',
        tags: ['test']
      }
    ],
    commands: [
      {
        name: 'test-command',
        category: 'test',
        description: 'Test command',
        version: '1.0.0',
        file: 'commands/test-command.md',
        path: 'commands/test-command.md',
        argumentHint: '<arg>',
        model: 'claude-3-5-sonnet-20241022',
        prefix: '/',
        tags: ['test']
      }
    ],
    mcpServers: [
      {
        name: 'test-server',
        display_name: 'Test Server',
        description: 'Test MCP server',
        verification: {
          status: 'verified'
        },
        installation_methods: [
          {
            type: 'claude-cli',
            recommended: true,
            command: 'claude mcp add test-server -- npx test-server',
            config_example: JSON.stringify({
              mcpServers: {
                'test-server': {
                  command: 'npx',
                  args: ['test-server']
                }
              }
            })
          }
        ],
        sources: {
          npm: 'test-server'
        }
      }
    ]
  }
}

/**
 * Setup environment for integration tests
 */
export async function setupIntegrationTest(): Promise<{
  testDir: string
  cleanup: () => Promise<void>
}> {
  const testDir = await createTestDir()
  
  // Set environment variables
  process.env.BWC_TEST_DIR = testDir
  process.env.BWC_CONFIG_PATH = path.join(testDir, 'bwc.config.json')
  
  return {
    testDir,
    cleanup: async () => {
      await cleanupTestDir(testDir)
      delete process.env.BWC_TEST_DIR
      delete process.env.BWC_CONFIG_PATH
    }
  }
}

/**
 * Compare objects ignoring certain fields
 */
export function compareObjects(
  actual: any,
  expected: any,
  ignoreFields: string[] = []
): boolean {
  const cleanObject = (obj: any) => {
    const cleaned = { ...obj }
    ignoreFields.forEach(field => delete cleaned[field])
    return cleaned
  }
  
  return JSON.stringify(cleanObject(actual)) === JSON.stringify(cleanObject(expected))
}