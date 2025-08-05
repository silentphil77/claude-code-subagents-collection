import { notFound } from 'next/navigation'
import { getMCPServerBySlug, getAllMCPServers } from '@/lib/mcp-server'
import MCPServerPageClient from './page-client'

export async function generateStaticParams() {
  const servers = getAllMCPServers()
  
  return servers.map((server) => ({
    slug: server.path.replace(/\//g, '-')
  }))
}

export default function MCPServerPage({ params }: { params: { slug: string } }) {
  const server = getMCPServerBySlug(params.slug)
  
  if (!server) {
    notFound()
  }
  
  return <MCPServerPageClient server={server} />
}