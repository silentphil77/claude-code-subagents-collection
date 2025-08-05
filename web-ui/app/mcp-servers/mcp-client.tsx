'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MCPCard } from '@/components/mcp-card'
import { CategoryFilter } from '@/components/category-filter'
import { SearchBar } from '@/components/search-bar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { type MCPServer, VERIFICATION_STATUS } from '@/lib/mcp-types'
import { type MCPCategoryMetadata } from '@/lib/mcp-server'

interface MCPPageClientProps {
  allServers: MCPServer[]
  categories: MCPCategoryMetadata[]
}

export default function MCPPageClient({ allServers, categories }: MCPPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [selectedVerification, setSelectedVerification] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Set initial filters from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const verificationParam = searchParams.get('verification')
    
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam)
    }
    
    if (verificationParam && ['verified', 'community', 'experimental'].includes(verificationParam)) {
      setSelectedVerification(verificationParam)
    }
  }, [searchParams, categories])
  
  // Handle category change and update URL
  const handleCategoryChange = (category: string | 'all') => {
    setSelectedCategory(category)
    updateURL({ category })
  }
  
  // Handle verification change
  const handleVerificationChange = (verification: string) => {
    setSelectedVerification(verification)
    updateURL({ verification })
  }
  
  // Update URL with new parameters
  const updateURL = (newParams: { category?: string | 'all', verification?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newParams.category !== undefined) {
      if (newParams.category === 'all') {
        params.delete('category')
      } else {
        params.set('category', newParams.category)
      }
    }
    
    if (newParams.verification !== undefined) {
      if (newParams.verification === 'all') {
        params.delete('verification')
      } else {
        params.set('verification', newParams.verification)
      }
    }
    
    const newUrl = params.toString() ? `/mcp-servers?${params.toString()}` : '/mcp-servers'
    router.replace(newUrl)
  }
  
  const filteredServers = useMemo(() => {
    let filtered = allServers
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(server => server.category === selectedCategory)
    }
    
    // Filter by verification status
    if (selectedVerification !== 'all') {
      filtered = filtered.filter(server => server.verification.status === selectedVerification)
    }
    
    // Filter by search query
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(normalizedQuery) ||
        server.display_name.toLowerCase().includes(normalizedQuery) ||
        server.description.toLowerCase().includes(normalizedQuery) ||
        server.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      )
    }
    
    return filtered
  }, [allServers, selectedCategory, selectedVerification, searchQuery])
  
  // Group servers by verification status
  const groupedServers = useMemo(() => {
    const groups = {
      verified: [] as MCPServer[],
      community: [] as MCPServer[],
      experimental: [] as MCPServer[]
    }
    
    filteredServers.forEach(server => {
      groups[server.verification.status].push(server)
    })
    
    return groups
  }, [filteredServers])
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">MCP Servers</h1>
          <p className="text-muted-foreground">
            Explore {allServers.length} Model Context Protocol (MCP) servers to extend Claude&apos;s capabilities. 
            Connect to databases, APIs, and external tools seamlessly.
          </p>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search MCP servers by name, description, or tags..."
          />
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>
        
        {/* Verification Tabs */}
        <Tabs value={selectedVerification} onValueChange={handleVerificationChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All Servers
              <Badge variant="secondary" className="ml-2">
                {filteredServers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified">
              {VERIFICATION_STATUS.verified.icon} Verified
              <Badge variant="secondary" className="ml-2">
                {groupedServers.verified.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="community">
              {VERIFICATION_STATUS.community.icon} Community
              <Badge variant="secondary" className="ml-2">
                {groupedServers.community.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="experimental">
              {VERIFICATION_STATUS.experimental.icon} Experimental
              <Badge variant="secondary" className="ml-2">
                {groupedServers.experimental.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredServers.length} of {allServers.length} servers
          {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.displayName || selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        
        {/* Grid */}
        {filteredServers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServers.map((server) => (
              <MCPCard key={server.path} server={server} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No MCP servers found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}