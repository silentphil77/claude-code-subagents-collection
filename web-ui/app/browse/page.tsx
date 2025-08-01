import { Suspense } from 'react'
import { getAllSubagents, getAllCategories } from '@/lib/subagents-server'
import BrowsePageClient from './browse-client'

export default function BrowsePage() {
  const allSubagents = getAllSubagents()
  const categories = getAllCategories()
  
  return (
    <Suspense fallback={null}>
      <BrowsePageClient allSubagents={allSubagents} categories={categories} />
    </Suspense>
  )
}