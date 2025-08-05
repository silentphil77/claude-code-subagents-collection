import { Suspense } from 'react'
import { getAllMCPServers, getAllMCPCategories } from '@/lib/mcp-server'
import MCPPageClient from './mcp-client'

export default function MCPServersPage() {
  const allServers = getAllMCPServers()
  const categories = getAllMCPCategories()
  
  return (
    <Suspense fallback={null}>
      <MCPPageClient allServers={allServers} categories={categories} />
    </Suspense>
  )
}