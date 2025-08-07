'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, ExternalLink, Github, Box, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MCPServer, 
  VERIFICATION_STATUS,
  SOURCE_INDICATORS,
  EXECUTION_INDICATORS, 
  getMCPCategoryDisplayName, 
  getMCPCategoryIcon 
} from '@/lib/mcp-types'

interface MCPServerPageClientProps {
  server: MCPServer
}

export default function MCPServerPageClient({ server }: MCPServerPageClientProps) {
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null)
  
  const verificationStatus = VERIFICATION_STATUS[server.verification.status]
  const categoryName = getMCPCategoryDisplayName(server.category)
  const categoryIcon = getMCPCategoryIcon(server.category)
  
  const handleCopyConfig = async (methodType: string, config: string) => {
    await navigator.clipboard.writeText(config)
    setCopiedConfig(methodType)
    setTimeout(() => setCopiedConfig(null), 2000)
  }
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Link href="/mcp-servers">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to MCP Servers
          </Button>
        </Link>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{categoryIcon}</span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{server.display_name}</h1>
              <p className="text-lg text-muted-foreground">{server.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Badge 
              variant="outline"
              className={verificationStatus.className}
            >
              {verificationStatus.icon} {verificationStatus.label}
            </Badge>
            <Badge variant="secondary">{categoryName}</Badge>
            <Badge variant="outline">Protocol v{server.protocol_version}</Badge>
            <Badge variant="outline">{server.server_type}</Badge>
            {server.execution_type && (
              <Badge variant="secondary">
                {EXECUTION_INDICATORS[server.execution_type].icon} {EXECUTION_INDICATORS[server.execution_type].label}
              </Badge>
            )}
            {server.source_registry && (
              <Badge variant="outline">
                {SOURCE_INDICATORS[server.source_registry.type]?.icon} {SOURCE_INDICATORS[server.source_registry.type]?.label}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Stats and Sources */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Stats Card */}
          {server.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {server.stats.github_stars && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GitHub Stars</span>
                    <span className="font-mono">⭐ {server.stats.github_stars.toLocaleString()}</span>
                  </div>
                )}
                {server.stats.docker_pulls && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Docker Pulls</span>
                    <span className="font-mono">🐳 {server.stats.docker_pulls.toLocaleString()}</span>
                  </div>
                )}
                {server.stats.npm_downloads && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">NPM Downloads</span>
                    <span className="font-mono">📦 {server.stats.npm_downloads.toLocaleString()}</span>
                  </div>
                )}
                {server.stats.last_updated && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-mono">{server.stats.last_updated}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Sources Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {server.sources.github && (
                <a 
                  href={server.sources.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Repository
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {server.sources.docker && (
                <a 
                  href={server.sources.docker} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    Docker Hub
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {server.sources.npm && (
                <a 
                  href={server.sources.npm} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    NPM Package
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {server.sources.documentation && (
                <a 
                  href={server.sources.documentation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    📚 Documentation
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {server.source_registry?.url && (
                <div className="pt-2 mt-2 border-t">
                  <a 
                    href={server.source_registry.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {SOURCE_INDICATORS[server.source_registry.type]?.icon} 
                      Source: {SOURCE_INDICATORS[server.source_registry.type]?.label}
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {server.source_registry.last_fetched && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last fetched: {new Date(server.source_registry.last_fetched).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Security Information */}
        {server.security && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Security Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Authentication:</span> {server.security.auth_type}
              </div>
              <div>
                <span className="font-semibold">Required Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {server.security.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
              {server.security.data_handling && (
                <div>
                  <span className="font-semibold">Data Handling:</span> {server.security.data_handling}
                </div>
              )}
              {server.security.audit_log !== undefined && (
                <div>
                  <span className="font-semibold">Audit Logging:</span> {server.security.audit_log ? 'Yes' : 'No'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Installation Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Installation Methods</CardTitle>
            <CardDescription>
              Choose your preferred installation method below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={server.installation_methods[0]?.type}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${server.installation_methods.length}, 1fr)` }}>
                {server.installation_methods.map((method) => (
                  <TabsTrigger key={method.type} value={method.type}>
                    {method.type === 'bwc' ? 'BWC CLI' : method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                    {method.recommended && ' ⭐'}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {server.installation_methods.map((method) => (
                <TabsContent key={method.type} value={method.type} className="space-y-4">
                  {method.command && (
                    <div>
                      <h4 className="font-semibold mb-2">Installation Command:</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{method.command}</code>
                      </pre>
                    </div>
                  )}
                  
                  {method.type === 'bwc' && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">This command will:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
                        <li>Enable the MCP server in Docker MCP Toolkit</li>
                        <li>Make it available through the Docker MCP gateway</li>
                        <li>Allow Claude Code to access the server</li>
                      </ul>
                    </div>
                  )}
                  
                  {method.config_example && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Configuration:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyConfig(method.type, method.config_example!)}
                        >
                          {copiedConfig === method.type ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{method.config_example}</code>
                      </pre>
                    </div>
                  )}
                  
                  {method.steps && (
                    <div>
                      <h4 className="font-semibold mb-2">Manual Installation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {method.steps.map((step, idx) => (
                          <li key={idx} className="text-muted-foreground">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {method.requirements && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {method.requirements.map((req, idx) => (
                          <li key={idx} className="text-muted-foreground">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {server.verification.tested_with && (
              <div>
                <span className="font-semibold">Tested With:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {server.verification.tested_with.map((client) => (
                    <Badge key={client} variant="outline" className="text-xs">
                      {client}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {server.verification.maintainer && (
              <div>
                <span className="font-semibold">Maintainer:</span> {server.verification.maintainer}
              </div>
            )}
            
            {server.verification.last_tested && (
              <div>
                <span className="font-semibold">Last Tested:</span> {server.verification.last_tested}
              </div>
            )}
            
            {server.tags.length > 0 && (
              <div>
                <span className="font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {server.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}