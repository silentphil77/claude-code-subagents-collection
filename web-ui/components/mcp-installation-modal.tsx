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
import { Copy, Check, Terminal, FileJson } from 'lucide-react'

interface MCPInstallationModalProps {
  isOpen: boolean
  onClose: () => void
  serverName: string
  displayName: string
  jsonConfig: string
  claudeCommand?: string
  serverType?: string
}

export function MCPInstallationModal({
  isOpen,
  onClose,
  serverName,
  displayName,
  jsonConfig,
  claudeCommand,
  serverType
}: MCPInstallationModalProps) {
  const [copiedCommand, setCopiedCommand] = useState(false)
  const [copiedJSON, setCopiedJSON] = useState(false)
  const [copiedClaude, setCopiedClaude] = useState(false)
  
  const bwcCommand = `bwc add --mcp ${serverName}`
  
  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText(bwcCommand)
    setCopiedCommand(true)
    setTimeout(() => setCopiedCommand(false), 2000)
  }
  
  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(jsonConfig)
    setCopiedJSON(true)
    setTimeout(() => setCopiedJSON(false), 2000)
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
        
        <Tabs defaultValue={claudeCommand ? "claude" : "json"} className="flex-1 flex flex-col">
          <TabsList className={`grid w-full ${claudeCommand ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {claudeCommand && (
              <TabsTrigger value="claude" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Claude Code
              </TabsTrigger>
            )}
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Manual Config
            </TabsTrigger>
          </TabsList>
          
          {claudeCommand && (
            <TabsContent value="claude" className="flex-1 overflow-auto space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Install this MCP server using Claude Code CLI:
                  </p>
                  {serverType && (
                    <div className="text-xs text-muted-foreground">
                      Server type: <span className="font-semibold">{serverType}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono text-sm">
                  <span className="break-all">{claudeCommand}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyClaude}
                    className="ml-2 flex-shrink-0"
                  >
                    {copiedClaude ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>This command will:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Install the MCP server to your Claude Code configuration</li>
                    <li>Make it available in your Claude conversations</li>
                    {serverType === 'sse' && <li>Connect to the remote server via Server-Sent Events</li>}
                    {serverType === 'stdio' && <li>Run the server locally on your machine</li>}
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs">
                  <p className="font-semibold mb-1">Prerequisites:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Claude Code must be installed</li>
                    {serverType === 'stdio' && <li>Node.js and npm must be installed</li>}
                    <li>Run the command in your terminal</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="json" className="flex-1 overflow-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  Copy the JSON configuration for manual setup:
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyJSON}
                  className="gap-2"
                >
                  {copiedJSON ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[400px] font-mono text-sm">
                  <code>{jsonConfig}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}