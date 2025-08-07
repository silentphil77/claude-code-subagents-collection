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
import { Copy, Star, Package, Box } from 'lucide-react'
import { 
  MCPServer, 
  VERIFICATION_STATUS, 
  SOURCE_INDICATORS, 
  EXECUTION_INDICATORS,
  getMCPCategoryDisplayName, 
  getMCPCategoryIcon 
} from '@/lib/mcp-types'
import { MCPInstallationModal } from './mcp-installation-modal'

interface MCPCardProps {
  server: MCPServer
}

export function MCPCard({ server }: MCPCardProps) {
  const [showInstallModal, setShowInstallModal] = useState(false)
  const verificationStatus = VERIFICATION_STATUS[server.verification.status]
  const categoryName = getMCPCategoryDisplayName(server.category)
  const categoryIcon = getMCPCategoryIcon(server.category)
  
  
  // Generate href for the detail page
  const serverSlug = server.path.replace(/\//g, '-')
  const href = `/mcp-server/${serverSlug}`
  
  return (
    <TooltipProvider>
      <Link href={href}>
        <Card className="h-full hover:shadow-lg transition-all duration-200 border-muted hover:border-primary/50 group relative overflow-hidden">
          {/* Hover actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy installation config</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{categoryIcon}</span>
                {/* Special badges */}
                {server.badges?.includes('popular') && (
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                    🔥 Popular
                  </Badge>
                )}
                {server.badges?.includes('featured') && (
                  <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                    ⭐ Featured
                  </Badge>
                )}
                {server.badges?.includes('trending') && (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                    📈 Trending
                  </Badge>
                )}
                <Badge 
                  variant="outline"
                  className={verificationStatus.className}
                >
                  {verificationStatus.icon} {verificationStatus.label}
                </Badge>
                {server.execution_type && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs">
                        {EXECUTION_INDICATORS[server.execution_type].icon} {EXECUTION_INDICATORS[server.execution_type].label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{EXECUTION_INDICATORS[server.execution_type].description}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {server.source_registry && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs">
                        {SOURCE_INDICATORS[server.source_registry.type]?.icon} {SOURCE_INDICATORS[server.source_registry.type]?.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{SOURCE_INDICATORS[server.source_registry.type]?.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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
      
      <MCPInstallationModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        serverName={server.name}
        displayName={server.display_name}
        serverType={server.server_type}
        jsonConfig={(() => {
          // Find the first installation method with config_example
          const methodWithConfig = server.installation_methods.find(m => m.config_example)
          
          // Return the config or generate default
          return methodWithConfig?.config_example || JSON.stringify({
            mcpServers: {
              [server.name]: {
                command: "npx",
                args: ["-y", server.name],
                env: {}
              }
            }
          }, null, 2)
        })()}
      />
    </TooltipProvider>
  )
}