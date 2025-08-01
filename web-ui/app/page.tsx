import { getAllSubagents, getAllCategories } from '@/lib/subagents-server'
import { getAllCommands, getAllCommandCategories } from '@/lib/commands-server'
import HomePageClient from './page-client'

export default function Home() {
  const allSubagents = getAllSubagents()
  const featuredSubagents = allSubagents.slice(0, 6)
  const categories = getAllCategories()
  
  const allCommands = getAllCommands()
  const featuredCommands = allCommands.slice(0, 6)
  const commandCategories = getAllCommandCategories()

  return (
    <HomePageClient 
      allSubagents={allSubagents} 
      featuredSubagents={featuredSubagents} 
      categories={categories}
      allCommands={allCommands}
      featuredCommands={featuredCommands}
      commandCategories={commandCategories}
    />
  )
}