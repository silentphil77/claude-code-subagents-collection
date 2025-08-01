'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SubagentCard } from '@/components/subagent-card'
import { CategoryFilter } from '@/components/category-filter'
import { SearchBar } from '@/components/search-bar'
import { type Subagent, type CategoryMetadata, generateCategoryDisplayName } from '@/lib/subagents-types'

interface BrowsePageClientProps {
  allSubagents: Subagent[]
  categories: CategoryMetadata[]
}

export default function BrowsePageClient({ allSubagents, categories }: BrowsePageClientProps) {
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
    const newUrl = params.toString() ? `/browse?${params.toString()}` : '/browse'
    router.replace(newUrl)
  }
  
  const filteredSubagents = useMemo(() => {
    let filtered = allSubagents
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(subagent => subagent.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(subagent => 
        subagent.name.toLowerCase().includes(normalizedQuery) ||
        subagent.description.toLowerCase().includes(normalizedQuery) ||
        subagent.content.toLowerCase().includes(normalizedQuery)
      )
    }
    
    return filtered
  }, [allSubagents, selectedCategory, searchQuery])
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Subagents</h1>
          <p className="text-muted-foreground">
            Explore our collection of {allSubagents.length} specialized AI subagents. 
            Hover over any card to instantly copy or download!
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search subagents by name, description, or content..."
          />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>
        
        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredSubagents.length} of {allSubagents.length} subagents
          {selectedCategory !== 'all' && ` in ${generateCategoryDisplayName(selectedCategory)}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        
        {/* Grid */}
        {filteredSubagents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubagents.map((subagent) => (
              <SubagentCard key={subagent.slug} subagent={subagent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No subagents found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}