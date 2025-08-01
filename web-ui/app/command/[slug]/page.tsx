import { notFound } from 'next/navigation'
import { getCommandBySlug, getAllCommands } from '@/lib/commands-server'
import { CommandPageClient } from './page-client'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const commands = getAllCommands()
  return commands.map((command) => ({
    slug: command.slug,
  }))
}

export default function CommandPage({ params }: PageProps) {
  const command = getCommandBySlug(params.slug)
  
  if (!command) {
    notFound()
  }
  
  return <CommandPageClient command={command} />
}