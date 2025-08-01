import { getAllSubagents } from '@/lib/subagents-server'
import BrowsePageClient from './browse-client'

export default function BrowsePage() {
  const allSubagents = getAllSubagents()
  
  return <BrowsePageClient allSubagents={allSubagents} />
}