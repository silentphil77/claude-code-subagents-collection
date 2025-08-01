import { getAllSubagents } from '@/lib/subagents-server'
import HomePageClient from './page-client'

export default function Home() {
  const allSubagents = getAllSubagents()
  const featuredSubagents = allSubagents.slice(0, 6)

  return <HomePageClient allSubagents={allSubagents} featuredSubagents={featuredSubagents} />
}