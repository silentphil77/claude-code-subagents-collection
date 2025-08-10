'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, Terminal } from 'lucide-react'

interface MCPInstallationModalProps {
  isOpen: boolean
  onClose: () => void
  serverName: string
  displayName: string
  jsonConfig: string
  claudeCommand?: string
  serverType?: string
  dockerHubUrl?: string
}

export function MCPInstallationModal({
  isOpen,
  onClose,
  serverName,
  displayName,
  jsonConfig,
  claudeCommand,
  serverType,
  dockerHubUrl
}: MCPInstallationModalProps) {
  const [copiedBWC, setCopiedBWC] = useState(false)
  const [copiedDocker, setCopiedDocker] = useState(false)
  const [copiedClaude, setCopiedClaude] = useState(false)
  
  const bwcCommand = `bwc add --mcp ${serverName}`
  const dockerCommand = `docker mcp server enable ${serverName}`
  
  const handleCopyBWC = async () => {
    await navigator.clipboard.writeText(bwcCommand)
    setCopiedBWC(true)
    setTimeout(() => setCopiedBWC(false), 2000)
  }
  
  const handleCopyDocker = async () => {
    await navigator.clipboard.writeText(dockerCommand)
    setCopiedDocker(true)
    setTimeout(() => setCopiedDocker(false), 2000)
  }
  
  const handleCopyClaude = async () => {
    if (claudeCommand) {
      await navigator.clipboard.writeText(claudeCommand)
      setCopiedClaude(true)
      setTimeout(() => setCopiedClaude(false), 2000)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Install {displayName}</DialogTitle>
          <DialogDescription>
            Choose how you want to install this MCP server
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="bwc" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bwc" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              BWC CLI ⭐
            </TabsTrigger>
            <TabsTrigger value="docker" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Docker MCP
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bwc" className="flex-1 overflow-auto space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Install this MCP server using BWC CLI:
                </p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono text-sm">
                <span className="break-all">{bwcCommand}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyBWC}
                  className="ml-2 flex-shrink-0"
                >
                  {copiedBWC ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>This command will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Enable the MCP server in Docker MCP Toolkit</li>
                  <li>Make it available through the Docker MCP gateway</li>
                  <li>Allow Claude Code to access the server</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-foreground">Prerequisites:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>BWC CLI must be installed: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">npm install -g @bwc/cli</code></li>
                  <li>Docker Desktop with MCP Toolkit enabled</li>
                  <li>Docker MCP gateway configured: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">bwc add --setup</code></li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-foreground">Quick Start:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                  <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">npm install -g @bwc/cli</code></li>
                  <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">bwc add --setup</code></li>
                  <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{bwcCommand}</code></li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="docker" className="flex-1 overflow-auto space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Enable this server using Docker MCP Toolkit:
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyDocker}
                  className="gap-2"
                >
                  {copiedDocker ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-auto">
                  <code className="text-sm font-mono">{dockerCommand}</code>
                </pre>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>This command will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Enable the MCP server in Docker MCP Toolkit</li>
                  <li>Configure it with default settings</li>
                  <li>Make it available through the Docker MCP gateway</li>
                  <li>Allow Claude Code to access the server</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-foreground">Prerequisites:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>Docker Desktop must be installed and running</li>
                  <li>Docker MCP Toolkit must be enabled</li>
                </ul>
              </div>
              
             
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}