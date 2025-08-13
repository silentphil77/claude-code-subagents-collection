import nock from 'nock'
import { createMockRegistry } from './test-utils'

/**
 * Setup mock registry server
 */
export function setupMockRegistry(
  baseUrl = 'https://buildwithclaude.com',
  customResponse?: any
) {
  const response = customResponse || createMockRegistry()
  
  return nock(baseUrl)
    .get('/registry.json')
    .reply(200, response)
}

/**
 * Setup mock registry with error
 */
export function setupMockRegistryError(
  baseUrl = 'https://buildwithclaude.com',
  statusCode = 500,
  message = 'Internal Server Error'
) {
  return nock(baseUrl)
    .get('/registry.json')
    .reply(statusCode, { error: message })
}

/**
 * Setup mock file download
 */
export function setupMockFileDownload(
  baseUrl = 'https://buildwithclaude.com',
  filePath: string,
  content: string
) {
  return nock(baseUrl)
    .get(`/${filePath}`)
    .reply(200, content)
}

/**
 * Setup mock GitHub raw content
 */
export function setupMockGitHubContent(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  content: string
) {
  return nock('https://raw.githubusercontent.com')
    .get(`/${owner}/${repo}/${branch}/${filePath}`)
    .reply(200, content)
}

/**
 * Clear all mocks
 */
export function clearAllMocks() {
  nock.cleanAll()
}

/**
 * Check if all mocks were called
 */
export function allMocksCalled(): boolean {
  return nock.isDone()
}

/**
 * Get pending mocks
 */
export function getPendingMocks(): string[] {
  return nock.pendingMocks()
}

/**
 * Setup comprehensive mock environment
 */
export function setupCompleteMockEnvironment() {
  // Mock registry
  const registry = createMockRegistry()
  setupMockRegistry('https://buildwithclaude.com', registry)
  
  // Mock subagent files
  registry.subagents.forEach(agent => {
    setupMockFileDownload(
      'https://buildwithclaude.com',
      agent.file,
      `---
name: ${agent.name}
category: ${agent.category}
tools: ${JSON.stringify(agent.tools)}
---

Mock content for ${agent.name}`
    )
  })
  
  // Mock command files
  registry.commands.forEach(command => {
    setupMockFileDownload(
      'https://buildwithclaude.com',
      command.file,
      `---
name: ${command.name}
category: ${command.category}
prefix: ${command.prefix}
---

Mock content for ${command.name}`
    )
  })
  
  return {
    registry,
    cleanup: clearAllMocks
  }
}