"use client"

import { useState, useEffect } from "react"
import { projects } from "@/data/projects"

export function useProjectsFilter() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Get all unique tags
  const allTags = Array.from(new Set(projects.flatMap((project) => project.tags))).sort()

  // Filter projects by selected tag and search query
  const filteredProjects = projects.filter((project) => {
    const matchesTag = !selectedTag || project.tags.includes(selectedTag)
    const matchesSearch =
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.blurb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTag && matchesSearch
  })

  const clearFilters = () => {
    setSelectedTag(null)
    setSearchQuery("")
  }

  const setTagFilter = (tag: string | null) => {
    setSelectedTag(tag)
  }

  // External API for command palette integration
  useEffect(() => {
    const handleProjectsFilter = (event: CustomEvent) => {
      const { tag } = event.detail
      setTagFilter(tag)
    }

    window.addEventListener("projects-filter" as any, handleProjectsFilter)
    return () => window.removeEventListener("projects-filter" as any, handleProjectsFilter)
  }, [])

  return {
    selectedTag,
    searchQuery,
    allTags,
    filteredProjects,
    setSelectedTag: setTagFilter,
    setSearchQuery,
    clearFilters,
    hasActiveFilters: selectedTag !== null || searchQuery !== "",
  }
}
