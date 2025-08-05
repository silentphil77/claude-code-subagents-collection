import fs from 'fs-extra'
import path from 'path'
import os from 'os'

export const HOME_DIR = os.homedir()
export const BWC_DIR = path.join(HOME_DIR, '.bwc')
export const CONFIG_PATH = path.join(BWC_DIR, 'config.json')
export const CLAUDE_DIR = path.join(HOME_DIR, '.claude')
export const AGENTS_DIR = path.join(CLAUDE_DIR, 'agents')
export const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands')

export async function ensureDir(dir: string): Promise<void> {
  await fs.ensureDir(dir)
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8')
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content, 'utf-8')
}

export async function readJSON<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath)
  return JSON.parse(content) as T
}

export async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2))
}

export function expandTilde(filePath: string): string {
  if (filePath.startsWith('~/')) {
    return path.join(HOME_DIR, filePath.slice(2))
  }
  return filePath
}

export async function deleteFile(filePath: string): Promise<void> {
  await fs.remove(filePath)
}