import { getAllSubagents, getAllCategories } from '@/lib/subagents-server'
import HomePageClient from './page-client'

export default function Home() {
  const allSubagents = getAllSubagents()
  const featuredSubagents = allSubagents.slice(0, 6)
  const categories = getAllCategories()

  return <HomePageClient allSubagents={allSubagents} featuredSubagents={featuredSubagents} categories={categories} />
}