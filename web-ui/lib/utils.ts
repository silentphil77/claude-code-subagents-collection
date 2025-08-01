import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Subagent } from "./subagents-types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSubagentMarkdown(subagent: Subagent): string {
  const frontmatter = [
    '---',
    `name: ${subagent.name}`,
    `description: ${subagent.description}`
  ]
  
  if (subagent.tools) {
    frontmatter.push(`tools: ${subagent.tools}`)
  }
  
  frontmatter.push('---', '')
  
  return frontmatter.join('\n') + subagent.content
}