import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { fileURLToPath } from 'url'
import path from 'path'

// Set test environment
process.env.NODE_ENV = 'test'
process.env.BWC_TEST = 'true'

// Disable console output during tests unless debugging
if (!process.env.DEBUG) {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  }

  beforeAll(() => {
    console.log = () => {}
    console.info = () => {}
    console.warn = () => {}
    // Keep error logging
  })

  afterAll(() => {
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })
}

// Clean up any test artifacts
afterEach(() => {
  // Reset environment variables
  delete process.env.BWC_TEST_DIR
  delete process.env.BWC_CONFIG_PATH
})

// Global test utilities
export const TEST_TIMEOUT = 10000
export const E2E_TIMEOUT = 30000