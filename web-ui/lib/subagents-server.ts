import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Subagent, CategoryKey, categoryMapping } from './subagents-types'

export function getAllSubagents(): Subagent[] {
  const subagentsDirectory = path.join(process.cwd(), '..')
  const fileNames = fs.readdirSync(subagentsDirectory)
  
  const subagents = fileNames
    .filter(fileName => fileName.endsWith('.md') && 
            !['README.md', 'CONTRIBUTING.md'].includes(fileName))
    .map(fileName => {
      const filePath = path.join(subagentsDirectory, fileName)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      const slug = fileName.replace(/\.md$/, '')
      const category = categoryMapping[slug] || 'specialized-domains'
      
      return {
        slug,
        name: data.name || slug,
        description: data.description || '',
        tools: data.tools,
        content,
        category
      }
    })
  
  return subagents.sort((a, b) => a.name.localeCompare(b.name))
}

export function getSubagentBySlug(slug: string): Subagent | null {
  const subagentsDirectory = path.join(process.cwd(), '..')
  const filePath = path.join(subagentsDirectory, `${slug}.md`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  const category = categoryMapping[slug] || 'specialized-domains'
  
  return {
    slug,
    name: data.name || slug,
    description: data.description || '',
    tools: data.tools,
    content,
    category
  }
}

export function getSubagentsByCategory(category: CategoryKey): Subagent[] {
  return getAllSubagents().filter(subagent => subagent.category === category)
}

export function searchSubagents(query: string): Subagent[] {
  const normalizedQuery = query.toLowerCase()
  return getAllSubagents().filter(subagent => 
    subagent.name.toLowerCase().includes(normalizedQuery) ||
    subagent.description.toLowerCase().includes(normalizedQuery) ||
    subagent.content.toLowerCase().includes(normalizedQuery)
  )
}