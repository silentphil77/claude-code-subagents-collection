'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CommandCard } from '@/components/command-card'
import { CategoryFilter } from '@/components/category-filter'
import { SearchBar } from '@/components/search-bar'
import { type Command, type CategoryMetadata, generateCategoryDisplayName } from '@/lib/commands-types'

interface CommandsPageClientProps {
  allCommands: Command[]
  categories: CategoryMetadata[]
}

export default function CommandsPageClient({ allCommands, categories }: CommandsPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Set initial category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams, categories])
  
  // Handle category change and update URL
  const handleCategoryChange = (category: string | 'all') => {
    setSelectedCategory(category)
    
    // Update URL with new category parameter
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    
    // Use replace to avoid adding to browser history for each filter change
    const newUrl = params.toString() ? `/commands?${params.toString()}` : '/commands'
    router.replace(newUrl)
  }
  
  const filteredCommands = useMemo(() => {
    let filtered = allCommands
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(command => command.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(command => 
        command.slug.toLowerCase().includes(normalizedQuery) ||
        command.description.toLowerCase().includes(normalizedQuery) ||
        command.content.toLowerCase().includes(normalizedQuery)
      )
    }
    
    return filtered
  }, [allCommands, selectedCategory, searchQuery])
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Commands</h1>
          <p className="text-muted-foreground">
            Explore our collection of {allCommands.length} slash commands for Claude Code. 
            Hover over any card to instantly copy or download!
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search commands by name, description, or content..."
          />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>
        
        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredCommands.length} of {allCommands.length} commands
          {selectedCategory !== 'all' && ` in ${generateCategoryDisplayName(selectedCategory)}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        
        {/* Grid */}
        {filteredCommands.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommands.map((command) => (
              <CommandCard key={command.slug} command={command} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No commands found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}