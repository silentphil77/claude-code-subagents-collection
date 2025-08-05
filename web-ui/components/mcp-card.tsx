'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy, Download, Check, Star, Package, Box, Terminal } from 'lucide-react'
import { MCPServer, VERIFICATION_STATUS, getMCPCategoryDisplayName, getMCPCategoryIcon } from '@/lib/mcp-types'
import { InstallationModalEnhanced } from './installation-modal-enhanced'

interface MCPCardProps {
  server: MCPServer
}

export function MCPCard({ server }: MCPCardProps) {
  const [copied, setCopied] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const verificationStatus = VERIFICATION_STATUS[server.verification.status]
  const categoryName = getMCPCategoryDisplayName(server.category)
  const categoryIcon = getMCPCategoryIcon(server.category)
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Copy the first installation method config
    const firstMethod = server.installation_methods[0]
    if (firstMethod?.config_example) {
      await navigator.clipboard.writeText(firstMethod.config_example)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Create config file content
    const firstMethod = server.installation_methods[0]
    const configContent = firstMethod?.config_example || '// No configuration available'
    
    const blob = new Blob([configContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-${server.name}-config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Generate href for the detail page
  const serverSlug = server.path.replace(/\//g, '-')
  const href = `/mcp-server/${serverSlug}`
  
  return (
    <TooltipProvider>
      <Link href={href}>
        <Card className="h-full hover:shadow-lg transition-all duration-200 border-muted hover:border-primary/50 group relative overflow-hidden">
          {/* Hover actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy configuration'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download configuration</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowInstallModal(true)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Terminal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Install with BWC CLI</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcon}</span>
                <Badge 
                  variant="outline"
                  className={verificationStatus.className}
                >
                  {verificationStatus.icon} {verificationStatus.label}
                </Badge>
              </div>
            </div>
            
            <CardTitle className="text-lg pr-20">{server.display_name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {server.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Stats */}
            {server.stats && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {server.stats.github_stars && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{server.stats.github_stars.toLocaleString()}</span>
                  </div>
                )}
                {server.stats.docker_pulls && (
                  <div className="flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    <span>{server.stats.docker_pulls.toLocaleString()}</span>
                  </div>
                )}
                {server.stats.npm_downloads && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{server.stats.npm_downloads.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Installation methods */}
            <div className="flex flex-wrap gap-1">
              {server.installation_methods.map((method, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {method.type}
                </Badge>
              ))}
            </div>
            
            {/* Tags */}
            {server.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {server.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {server.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{server.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
      
      <InstallationModalEnhanced
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        resourceType="mcp"
        resourceName={server.name}
        displayName={server.display_name}
        markdownContent={`# ${server.display_name}\n\n${server.description}\n\n## Installation\n\n${server.installation_methods[0]?.command || ''}\n\n## Configuration\n\n\`\`\`json\n${server.installation_methods[0]?.config_example || ''}\n\`\`\``}
      />
    </TooltipProvider>
  )
}