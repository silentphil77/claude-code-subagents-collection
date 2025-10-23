import { existsSync, readFileSync } from 'fs'
import process from 'process'

/**
 * Platform Detection Utilities
 * Handles cross-platform command resolution, including WSL2 detection
 */

/**
 * Check if running in WSL (Windows Subsystem for Linux)
 */
export function isWSL(): boolean {
  try {
    // Check for WSL_DISTRO_NAME environment variable (WSL2)
    if (process.env.WSL_DISTRO_NAME) {
      return true
    }

    // Check /proc/version for Microsoft or WSL markers
    if (existsSync('/proc/version')) {
      const version = readFileSync('/proc/version', 'utf8').toLowerCase()
      if (version.includes('microsoft') || version.includes('wsl')) {
        return true
      }
    }
  } catch {
    // If we can't determine, assume not WSL
  }

  return false
}

/**
 * Get the correct Docker command for the current platform
 * Returns 'docker.exe' on WSL, 'docker' elsewhere
 */
export function getDockerCommand(): string {
  return isWSL() ? 'docker.exe' : 'docker'
}
