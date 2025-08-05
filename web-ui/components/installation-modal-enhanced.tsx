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
import { Copy, Check, Terminal, FileText } from 'lucide-react'
import { generateBWCCommands, generateBWCInstallScript, type ResourceType } from '@/lib/bwc-utils'

interface InstallationModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  resourceType: ResourceType
  resourceName: string
  markdownContent: string
  displayName?: string
}

export function InstallationModalEnhanced({
  isOpen,
  onClose,
  resourceType,
  resourceName,
  markdownContent,
  displayName
}: InstallationModalEnhancedProps) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  
  const bwcCommands = generateBWCCommands(resourceType, resourceName)
  const installScript = generateBWCInstallScript(resourceType, resourceName)
  
  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(markdownContent)
    setCopiedMarkdown(true)
    setTimeout(() => setCopiedMarkdown(false), 2000)
  }
  
  const handleCopyCommand = async (command: string, commandKey: string) => {
    await navigator.clipboard.writeText(command)
    setCopiedCommand(commandKey)
    setTimeout(() => setCopiedCommand(null), 2000)
  }
  
  const handleCopyAllCommands = async () => {
    await navigator.clipboard.writeText(installScript)
    setCopiedCommand('all')
    setTimeout(() => setCopiedCommand(null), 2000)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Install {displayName || resourceName}</DialogTitle>
          <DialogDescription>
            Choose how you want to install this {resourceType}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="bwc" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bwc" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              BWC CLI
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Copy Markdown
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bwc" className="flex-1 overflow-auto space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use the BWC CLI tool to install and manage this {resourceType}:
              </p>
              
              {/* Individual Commands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono text-sm">
                  <span>{bwcCommands.install}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCommand(bwcCommands.install, 'install')}
                  >
                    {copiedCommand === 'install' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground pl-1">
                  Install the {resourceType} to your local configuration
                </div>
              </div>
              
              {/* Other useful commands */}
              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2">Other useful commands:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded font-mono text-xs">
                    <span>{bwcCommands.info}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => handleCopyCommand(bwcCommands.info, 'info')}
                    >
                      {copiedCommand === 'info' ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded font-mono text-xs">
                    <span>{bwcCommands.list}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => handleCopyCommand(bwcCommands.list, 'list')}
                    >
                      {copiedCommand === 'list' ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  {bwcCommands.search && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded font-mono text-xs">
                      <span>{bwcCommands.search}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => handleCopyCommand(bwcCommands.search!, 'search')}
                      >
                        {copiedCommand === 'search' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Copy all commands */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyAllCommands}
                >
                  {copiedCommand === 'all' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Copied all commands!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy all commands
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="markdown" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy the markdown content to use directly in your project:
              </p>
              
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[400px] text-sm">
                  <code>{markdownContent}</code>
                </pre>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyMarkdown}
              >
                {copiedMarkdown ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied markdown!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy markdown content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}