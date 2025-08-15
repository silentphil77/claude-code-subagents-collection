import { execa } from 'execa'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

/**
 * Claude CLI Detector
 * Finds the Claude Code CLI executable location
 */

let cachedClaudePath: string | null = null

/**
 * Common locations where Claude CLI might be installed
 */
const CLAUDE_CLI_PATHS = [
  join(homedir(), '.claude', 'local', 'claude'),
  '/usr/local/bin/claude',
  '/opt/homebrew/bin/claude',
  join(homedir(), '.local', 'bin', 'claude'),
]

/**
 * Find the Claude CLI executable path
 */
export async function findClaudeCLI(): Promise<string> {
  // Return cached path if available
  if (cachedClaudePath) {
    return cachedClaudePath
  }

  // Check common installation paths
  for (const path of CLAUDE_CLI_PATHS) {
    if (existsSync(path)) {
      cachedClaudePath = path
      return path
    }
  }

  // Try to find using 'which' command (won't work with aliases)
  try {
    const { stdout } = await execa('which', ['claude'])
    if (stdout && existsSync(stdout.trim())) {
      cachedClaudePath = stdout.trim()
      return cachedClaudePath
    }
  } catch {
    // Ignore errors from 'which'
  }

  // Try command -v (works better with some shells)
  try {
    const { stdout } = await execa('sh', ['-c', 'command -v claude'])
    if (stdout && existsSync(stdout.trim())) {
      cachedClaudePath = stdout.trim()
      return cachedClaudePath
    }
  } catch {
    // Ignore errors
  }

  // If not found, throw an error
  throw new Error(
    'Claude Code CLI not found. Please ensure Claude Code is installed.\n' +
    'Installation guide: https://docs.anthropic.com/en/docs/claude-code/quickstart'
  )
}

/**
 * Check if Claude CLI is available
 */
export async function isClaudeCLIAvailable(): Promise<boolean> {
  try {
    await findClaudeCLI()
    return true
  } catch {
    return false
  }
}

/**
 * Execute a Claude CLI command
 */
export async function execClaudeCLI(args: string[], options?: any): Promise<{ stdout: string; stderr: string }> {
  const claudePath = await findClaudeCLI()
  return execa(claudePath, args, options)
}

/**
 * Reset the cached Claude path (useful for testing)
 */
export function resetClaudePathCache(): void {
  cachedClaudePath = null
}