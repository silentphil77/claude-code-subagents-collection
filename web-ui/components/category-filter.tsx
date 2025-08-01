'use client'

import { Button } from '@/components/ui/button'
import { CATEGORIES, type CategoryKey } from '@/lib/subagents-types'

interface CategoryFilterProps {
  selectedCategory: CategoryKey | 'all'
  onCategoryChange: (category: CategoryKey | 'all') => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('all')}
      >
        All Categories
      </Button>
      {Object.entries(CATEGORIES).map(([key, label]) => (
        <Button
          key={key}
          variant={selectedCategory === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(key as CategoryKey)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}