"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, File, Clock } from "lucide-react"
import { type FileNode, getAllFiles } from "@/data/files"
import { fsOperations } from "@/lib/fs/operations"

interface QuickOpenProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: FileNode, asPreview?: boolean) => void
}

interface SearchResult {
  file: FileNode
  score: number
  matchIndices: number[]
}

export function QuickOpen({ isOpen, onClose, onFileSelect }: QuickOpenProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      inputRef.current?.focus()
      loadRecentFiles()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.trim() === "") {
      // Show recent files when no query
      const fsState = fsOperations.getState()
      const recentResults = recentFiles
        .map((path) => {
          const allFiles = getAllFiles()
          return allFiles.find((f) => f.path === path)
        })
        .filter(Boolean)
        .map((file) => ({
          file: file!,
          score: 1,
          matchIndices: [],
        }))
      setResults(recentResults)
    } else {
      // Perform fuzzy search
      const searchResults = performFuzzySearch(query)
      setResults(searchResults)
    }
    setSelectedIndex(0)
  }, [query, recentFiles])

  const loadRecentFiles = () => {
    try {
      const saved = localStorage.getItem("neo.ide.recent.files")
      if (saved) {
        setRecentFiles(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load recent files:", error)
    }
  }

  const saveRecentFile = (path: string) => {
    try {
      const updated = [path, ...recentFiles.filter((p) => p !== path)].slice(0, 10)
      setRecentFiles(updated)
      localStorage.setItem("neo.ide.recent.files", JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save recent file:", error)
    }
  }

  const performFuzzySearch = (searchQuery: string): SearchResult[] => {
    const allFiles = getAllFiles().filter((f) => f.type === "file")
    const query = searchQuery.toLowerCase()

    return allFiles
      .map((file) => {
        const fileName = file.name.toLowerCase()
        const filePath = file.path.toLowerCase()

        // Calculate score based on matches
        let score = 0
        const matchIndices: number[] = []

        // Exact name match gets highest score
        if (fileName.includes(query)) {
          score += 100
          const startIndex = fileName.indexOf(query)
          for (let i = 0; i < query.length; i++) {
            matchIndices.push(startIndex + i)
          }
        }

        // Path match gets medium score
        if (filePath.includes(query)) {
          score += 50
        }

        // Fuzzy match gets lower score
        let queryIndex = 0
        for (let i = 0; i < fileName.length && queryIndex < query.length; i++) {
          if (fileName[i] === query[queryIndex]) {
            score += 10
            matchIndices.push(i)
            queryIndex++
          }
        }

        // Bonus for matching all characters
        if (queryIndex === query.length) {
          score += 20
        }

        return { file, score, matchIndices }
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Limit results
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (results[selectedIndex]) {
          const asPreview = !e.shiftKey && !e.metaKey && !e.ctrlKey
          handleFileSelect(results[selectedIndex].file, asPreview)
        }
        break
      case "Escape":
        e.preventDefault()
        onClose()
        break
    }
  }

  const handleFileSelect = (file: FileNode, asPreview = true) => {
    saveRecentFile(file.path)
    onFileSelect(file, asPreview)
    onClose()
  }

  const highlightMatch = (text: string, matchIndices: number[]) => {
    if (matchIndices.length === 0) return text

    const parts = []
    let lastIndex = 0

    matchIndices.forEach((index) => {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index))
      }
      parts.push(
        <span key={index} className="bg-neo-fg text-neo-bg font-bold">
          {text[index]}
        </span>,
      )
      lastIndex = index + 1
    })

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-neo-bg border-4 border-neo-fg rounded-xl shadow-neo w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-4 border-b-2 border-neo-fg">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neo-fg" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files by name or path..."
              className="flex-1 bg-transparent text-neo-fg placeholder-neo-fg placeholder-opacity-60 outline-none text-lg"
            />
          </div>
          <div className="mt-2 text-xs text-neo-fg opacity-60">
            {query ? `${results.length} results` : "Recent files"}
            {" • "}
            <kbd className="px-1 py-0.5 bg-neo-bg2 border border-neo-fg rounded text-xs">Enter</kbd> to open as preview
            {" • "}
            <kbd className="px-1 py-0.5 bg-neo-bg2 border border-neo-fg rounded text-xs">Shift+Enter</kbd> to pin
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-neo-fg opacity-60">{query ? "No files found" : "No recent files"}</div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.file.path}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-neo-fg border-opacity-20 ${
                  index === selectedIndex ? "bg-neo-bg2" : "hover:bg-neo-bg2"
                }`}
                onClick={() => handleFileSelect(result.file, true)}
                onDoubleClick={() => handleFileSelect(result.file, false)}
              >
                <div className="flex-shrink-0">
                  {query === "" ? (
                    <Clock className="w-4 h-4 text-neo-fg opacity-60" />
                  ) : (
                    <File className="w-4 h-4 text-neo-fg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neo-fg truncate">
                    {highlightMatch(result.file.name, result.matchIndices)}
                  </div>
                  <div className="text-sm text-neo-fg opacity-60 truncate">{result.file.path}</div>
                </div>
                {result.file.language && (
                  <div className="flex-shrink-0 text-xs text-neo-fg opacity-60 uppercase">{result.file.language}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
