"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { fuzzySearch } from "@/lib/fuzzy"
import { appRegistry } from "@/lib/app-registry"
import { projects } from "@/data/projects"
import { skills } from "@/data/skills"

export interface CommandAction {
  id: string
  label: string
  category: "app" | "project" | "skill" | "action" | "file"
  payload?: any
  keywords?: string[]
  description?: string
  tags?: string[]
  priority?: "high" | "medium" | "low"
  slug?: string
  isPinned?: boolean
  lastUsed?: number
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExecute: (action: CommandAction) => void
}

type FilterType = "all" | "apps" | "projects" | "skills" | "actions" | "files"

const filterOptions = [
  { value: "all" as FilterType, label: "All Items", count: 0 },
  { value: "apps" as FilterType, label: "Applications", count: 0 },
  { value: "files" as FilterType, label: "Files", count: 0 },
  { value: "projects" as FilterType, label: "Projects", count: 0 },
  { value: "skills" as FilterType, label: "Skills", count: 0 },
  { value: "actions" as FilterType, label: "Actions", count: 0 },
]

const STORAGE_KEYS = {
  PINNED: "neo-os-pinned-items",
  RECENT: "neo-os-recent-items",
}

const getPinnedItems = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PINNED) || "[]")
  } catch {
    return []
  }
}

const getRecentItems = (): Array<{ id: string; timestamp: number }> => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT) || "[]")
  } catch {
    return []
  }
}

const addToRecent = (itemId: string) => {
  if (typeof window === "undefined") return
  const recent = getRecentItems().filter((item) => item.id !== itemId)
  recent.unshift({ id: itemId, timestamp: Date.now() })
  localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent.slice(0, 3)))
}

const togglePinned = (itemId: string) => {
  if (typeof window === "undefined") return
  const pinned = getPinnedItems()
  const newPinned = pinned.includes(itemId) ? pinned.filter((id) => id !== itemId) : [...pinned, itemId].slice(0, 3)
  localStorage.setItem(STORAGE_KEYS.PINNED, JSON.stringify(newPinned))
}

const CategoryIcon = ({ category }: { category: CommandAction["category"] }) => {
  const iconProps = {
    width: 16,
    height: 16,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (category) {
    case "app":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      )
    case "file":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      )
    case "project":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )
    case "skill":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )
    case "action":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

const PriorityIndicator = ({ priority }: { priority?: "high" | "medium" | "low" }) => {
  if (!priority) return null

  const colors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  }

  return <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
}

const CategoryTag = ({ category, count }: { category: string; count?: number }) => {
  const colors = {
    app: "bg-blue-100 text-blue-800 border-blue-200",
    file: "bg-gray-100 text-gray-800 border-gray-200",
    project: "bg-green-100 text-green-800 border-green-200",
    skill: "bg-purple-100 text-purple-800 border-purple-200",
    action: "bg-orange-100 text-orange-800 border-orange-200",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {category}
      {count !== undefined && <span className="text-xs opacity-75">({count})</span>}
    </span>
  )
}

const PreviewPanel = ({ item }: { item: CommandAction | null }) => {
  if (!item) {
    return (
      <div className="w-80 bg-neo-bg2 border-l-2 border-neo-border p-6 flex items-center justify-center">
        <div className="text-center text-neo-fg-muted">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neo-bg3 flex items-center justify-center">
            <CategoryIcon category="app" />
          </div>
          <div className="text-sm">Select an item to preview</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-neo-bg2 border-l-2 border-neo-border p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-neo-fg text-neo-bg rounded-lg flex items-center justify-center flex-shrink-0">
          <CategoryIcon category={item.category} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neo-fg text-lg mb-1 truncate">{item.label}</h3>
          <CategoryTag category={item.category} />
        </div>
      </div>

      {item.description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neo-fg mb-2">Description</h4>
          <p className="text-sm text-neo-fg-muted leading-relaxed">{item.description}</p>
        </div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neo-fg mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-neo-bg3 text-neo-fg border border-neo-border/20 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.keywords && item.keywords.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neo-fg mb-2">Keywords</h4>
          <div className="text-xs text-neo-fg-muted">
            {item.keywords.slice(0, 5).join(", ")}
            {item.keywords.length > 5 && "..."}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-neo-border/20">
        <div className="flex items-center justify-between text-xs text-neo-fg-muted">
          <span>ID: {item.id}</span>
          {item.priority && <PriorityIndicator priority={item.priority} />}
        </div>
      </div>
    </div>
  )
}

export function CommandPalette({ open, onOpenChange, onExecute }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [pinnedItems, setPinnedItems] = useState<string[]>([])
  const [recentItems, setRecentItems] = useState<Array<{ id: string; timestamp: number }>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPinnedItems(getPinnedItems())
    setRecentItems(getRecentItems())
  }, [open])

  const searchIndex = useMemo(() => {
    const items: CommandAction[] = []

    // Add apps
    appRegistry.forEach((app) => {
      items.push({
        id: `app-${app.id}`,
        label: `Open ${app.title}`,
        category: "app",
        description: `Launch the ${app.title} application`,
        payload: { appId: app.id, title: app.title },
        keywords: app.keywords,
        priority: "medium",
        slug: app.id,
      })
    })

    const files = [
      { path: "/About.md", name: "About.md", kind: "about" },
      { path: "/Projects/E-Commerce Platform.md", name: "E-Commerce Platform.md", kind: "project" },
      { path: "/Projects/Task Management App.md", name: "Task Management App.md", kind: "project" },
      { path: "/Skills/Frontend.md", name: "Frontend.md", kind: "skill" },
      { path: "/Contact.md", name: "Contact.md", kind: "contact" },
    ]

    files.forEach((file) => {
      items.push({
        id: `file-${file.path}`,
        label: file.name,
        category: "file",
        description: `Open ${file.name} in IDE`,
        payload: { filePath: file.path, fileName: file.name },
        keywords: [file.name, file.kind, "file", "open"],
        priority: "low",
        slug: file.path,
      })
    })

    // Add projects
    projects.forEach((project) => {
      items.push({
        id: `project-${project.slug}`,
        label: project.title,
        category: "project",
        description: project.blurb,
        tags: project.tags,
        payload: { project },
        keywords: [project.title, ...project.tags, project.blurb],
        priority: "high",
        slug: project.slug,
      })

      // Add project tags as filter actions
      project.tags.forEach((tag) => {
        if (!items.some((item) => item.id === `filter-${tag}`)) {
          items.push({
            id: `filter-${tag}`,
            label: `Filter projects by ${tag}`,
            category: "action",
            description: `Show only projects tagged with ${tag}`,
            payload: { action: "filter-projects", tag },
            keywords: [tag, "filter", "projects"],
            priority: "low",
            slug: `filter-${tag}`,
          })
        }
      })
    })

    // Add skills
    skills.forEach((skill) => {
      items.push({
        id: `skill-${skill.name}`,
        label: skill.name,
        category: "skill",
        description: `${skill.level} level in ${skill.category}`,
        payload: { skill },
        keywords: [skill.name, skill.category, skill.level],
        priority: skill.level === "Expert" ? "high" : skill.level === "Advanced" ? "medium" : "low",
        slug: skill.name.toLowerCase().replace(/\s+/g, "-"),
      })
    })

    // Add system actions
    items.push(
      {
        id: "action-close-all",
        label: "Close all windows",
        category: "action",
        description: "Close all currently open application windows",
        payload: { action: "close-all" },
        keywords: ["close", "windows", "all"],
        priority: "medium",
        slug: "close-all",
      },
      {
        id: "action-minimize-all",
        label: "Minimize all windows",
        category: "action",
        description: "Minimize all currently open application windows",
        payload: { action: "minimize-all" },
        keywords: ["minimize", "windows", "all"],
        priority: "low",
        slug: "minimize-all",
      },
    )

    return items
  }, [])

  const filteredResults = useMemo(() => {
    let filtered = searchIndex

    if (activeFilter !== "all") {
      const categoryMap = {
        apps: "app",
        files: "file",
        projects: "project",
        skills: "skill",
        actions: "action",
      }
      filtered = searchIndex.filter((item) => item.category === categoryMap[activeFilter])
    }

    // Enhanced fuzzy search with better scoring: title > slug > tags > description
    const results = fuzzySearch(
      filtered,
      query,
      (item) => {
        const parts = []
        parts.push(item.label) // Title gets highest priority
        if (item.slug) parts.push(item.slug) // Slug gets second priority
        if (item.tags) parts.push(...item.tags) // Tags get third priority
        if (item.description) parts.push(item.description) // Description gets lowest priority
        if (item.keywords) parts.push(...item.keywords)
        return parts.join(" ")
      },
      query ? 12 : 20,
    )

    // Add pinned and recent items to the top when no query
    if (!query) {
      const pinnedResults = pinnedItems
        .map((id) => searchIndex.find((item) => item.id === id))
        .filter(Boolean)
        .map((item) => ({ ...item!, isPinned: true }))

      const recentResults = recentItems
        .map(({ id }) => searchIndex.find((item) => item.id === id))
        .filter(Boolean)
        .filter((item) => !pinnedItems.includes(item!.id))
        .map((item) => ({ ...item!, lastUsed: recentItems.find((r) => r.id === item!.id)?.timestamp }))

      return [...pinnedResults, ...recentResults, ...results.filter((r) => !pinnedItems.includes(r.id))]
    }

    // Update filter counts
    filterOptions.forEach((option) => {
      if (option.value === "all") {
        option.count = searchIndex.length
      } else {
        const categoryMap = {
          apps: "app",
          files: "file",
          projects: "project",
          skills: "skill",
          actions: "action",
        }
        option.count = searchIndex.filter((item) => item.category === categoryMap[option.value]).length
      }
    })

    return results
  }, [searchIndex, query, activeFilter, pinnedItems, recentItems])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredResults])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setQuery("")
      setSelectedIndex(0)
      setActiveFilter("all")
      setShowFilters(false)
    }
  }, [open])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "Escape":
          e.preventDefault()
          if (showFilters) {
            setShowFilters(false)
          } else {
            onOpenChange(false)
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (showFilters) {
            // Navigate through filters
          } else {
            setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1))
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (showFilters) {
            // Navigate through filters
          } else {
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
          }
          break
        case "Enter":
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            const item = filteredResults[selectedIndex]
            addToRecent(item.id)
            setRecentItems(getRecentItems())
            onExecute(item)
            onOpenChange(false)
          }
          break
        case "Tab":
          e.preventDefault()
          setShowFilters(!showFilters)
          break
        case "p":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            if (filteredResults[selectedIndex]) {
              togglePinned(filteredResults[selectedIndex].id)
              setPinnedItems(getPinnedItems())
            }
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, filteredResults, selectedIndex, onExecute, onOpenChange, showFilters])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  if (!open) return null

  const highlightMatch = (text: string, indices: number[]) => {
    if (indices.length === 0) return text

    const parts = []
    let lastIndex = 0

    indices.forEach((index) => {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index))
      }
      parts.push(
        <mark key={index} className="bg-neo-fg text-neo-bg font-semibold rounded px-0.5">
          {text[index]}
        </mark>,
      )
      lastIndex = index + 1
    })

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  const selectedItem = filteredResults[selectedIndex] || null

  return (
    <div className="fixed inset-0 bg-neo-bg bg-opacity-10 flex items-start justify-center pt-20 z-50 backdrop-blur-sm">
      <div className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-xl w-full max-w-6xl mx-4 overflow-hidden flex">
        {/* Main Panel */}
        <div className="flex-1">
          <div className="p-6 border-b border-neo-border/20">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neo-fg-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name, category, tags, or description..."
                  className="w-full pl-10 pr-4 py-3 text-lg font-medium bg-neo-bg2 border border-neo-border/30 rounded-lg outline-none placeholder-neo-fg-muted caret-neo-fg text-neo-fg focus:border-neo-border focus:bg-neo-bg"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-neo-bg2 border border-neo-border/30 rounded-lg text-neo-fg hover:bg-neo-bg3 transition-colors"
                >
                  <CategoryTag
                    category={activeFilter}
                    count={filterOptions.find((f) => f.value === activeFilter)?.count}
                  />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-neo-bg border-2 border-neo-border shadow-neo rounded-lg overflow-hidden z-10">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setActiveFilter(option.value)
                          setShowFilters(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neo-bg2 transition-colors ${
                          activeFilter === option.value ? "bg-neo-bg2" : ""
                        }`}
                      >
                        <span className="font-medium text-neo-fg">{option.label}</span>
                        <span className="text-sm text-neo-fg-muted">{option.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div ref={listRef} className="max-h-96 overflow-y-auto">
            {!query && pinnedItems.length > 0 && (
              <div className="p-4 border-b border-neo-border/20">
                <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-3">Pinned</h3>
                {filteredResults
                  .filter((item) => item.isPinned)
                  .slice(0, 3)
                  .map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        addToRecent(result.id)
                        setRecentItems(getRecentItems())
                        onExecute(result)
                        onOpenChange(false)
                      }}
                      className={`w-full flex items-start gap-4 p-3 text-left transition-all duration-150 rounded-lg mb-2 ${
                        index === selectedIndex ? "bg-neo-fg text-neo-bg" : "bg-neo-bg2 hover:bg-neo-bg3"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 border border-neo-border/30 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          index === selectedIndex ? "bg-neo-bg text-neo-fg" : "bg-neo-fg text-neo-bg"
                        }`}
                      >
                        <CategoryIcon category={result.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{result.label}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryTag category={result.category} />
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {!query && recentItems.length > 0 && (
              <div className="p-4 border-b border-neo-border/20">
                <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-3">Recent</h3>
                {filteredResults
                  .filter((item) => item.lastUsed && !item.isPinned)
                  .slice(0, 3)
                  .map((result, index) => {
                    const adjustedIndex = index + (pinnedItems.length > 0 ? 3 : 0)
                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          addToRecent(result.id)
                          setRecentItems(getRecentItems())
                          onExecute(result)
                          onOpenChange(false)
                        }}
                        className={`w-full flex items-start gap-4 p-3 text-left transition-all duration-150 rounded-lg mb-2 ${
                          adjustedIndex === selectedIndex ? "bg-neo-fg text-neo-bg" : "bg-neo-bg2 hover:bg-neo-bg3"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 border border-neo-border/30 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            adjustedIndex === selectedIndex ? "bg-neo-bg text-neo-fg" : "bg-neo-fg text-neo-bg"
                          }`}
                        >
                          <CategoryIcon category={result.category} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{result.label}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryTag category={result.category} />
                            <span className="text-xs text-neo-fg-muted">
                              {new Date(result.lastUsed!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}

            {/* All Results */}
            {filteredResults.length > 0 ? (
              <div className="p-4">
                {query && <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-3">Results</h3>}
                {filteredResults
                  .filter((item) => query || (!item.isPinned && !item.lastUsed))
                  .map((result, index) => {
                    const adjustedIndex =
                      index + (!query ? (pinnedItems.length > 0 ? 3 : 0) + (recentItems.length > 0 ? 3 : 0) : 0)
                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          addToRecent(result.id)
                          setRecentItems(getRecentItems())
                          onExecute(result)
                          onOpenChange(false)
                        }}
                        className={`w-full flex items-start gap-4 p-4 text-left transition-all duration-150 ${
                          adjustedIndex === selectedIndex
                            ? "bg-neo-fg text-neo-bg"
                            : index % 2 === 0
                              ? "bg-neo-bg"
                              : "bg-neo-bg2"
                        } hover:bg-neo-fg hover:text-neo-bg group`}
                      >
                        <div
                          className={`w-10 h-10 border border-neo-border/30 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            adjustedIndex === selectedIndex ? "bg-neo-bg text-neo-fg" : "bg-neo-fg text-neo-bg"
                          }`}
                        >
                          <CategoryIcon category={result.category} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-base">
                              {query && result.fuzzyMatch
                                ? highlightMatch(result.label, result.fuzzyMatch.indices)
                                : result.label}
                            </div>
                            <PriorityIndicator priority={result.priority} />
                            {pinnedItems.includes(result.id) && (
                              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            )}
                          </div>
                          {result.description && (
                            <div
                              className={`text-sm mb-2 ${adjustedIndex === selectedIndex ? "text-neo-bg/70" : "text-neo-fg-muted"}`}
                            >
                              {result.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CategoryTag category={result.category} />
                            {result.tags &&
                              result.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-2 py-1 text-xs rounded-md border ${
                                    adjustedIndex === selectedIndex
                                      ? "bg-neo-bg/20 text-neo-bg border-neo-bg/30"
                                      : "bg-neo-bg2 text-neo-fg-muted border-neo-border/20"
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div
                            className={`text-xs font-mono ${adjustedIndex === selectedIndex ? "text-neo-bg/70" : "text-neo-fg-muted"}`}
                          >
                            {adjustedIndex === selectedIndex ? "↵" : ""}
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            ) : (
              <div className="p-12 text-center text-neo-fg-muted">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-bg2 flex items-center justify-center">
                  <svg width="32" height="32" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <div className="font-semibold mb-2 text-lg">No results found</div>
                <div className="text-sm">Try adjusting your search terms or filters</div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-neo-border/20 bg-neo-bg2">
            <div className="flex items-center justify-between text-xs text-neo-fg-muted font-medium">
              <div className="flex items-center gap-4">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>⌘P pin</span>
                <span>tab filters</span>
                <span>esc close</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{filteredResults.length} results</span>
                {activeFilter !== "all" && (
                  <button onClick={() => setActiveFilter("all")} className="text-neo-fg hover:underline">
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <PreviewPanel item={selectedItem} />
      </div>
    </div>
  )
}
