"use client"

import { useState, useEffect, useRef } from "react"
import { Search, FileText, ChevronRight, ChevronDown } from "lucide-react"
import { searchIndexManager, type SearchResult } from "@/lib/search/index"
import { getAllFiles } from "@/data/files"
import { fsOperations } from "@/lib/fs/operations"

interface GlobalSearchProps {
  onFileOpen: (filePath: string, line?: number, column?: number) => void
}

export function GlobalSearch({ onFileOpen }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize search index with all files
    const allFiles = getAllFiles().filter((f) => f.type === "file" && f.content)
    allFiles.forEach((file) => {
      if (file.content) {
        searchIndexManager.updateFileIndex(file.path, file.content)
      }
    })

    // Update index when files change
    const unsubscribe = fsOperations.subscribe((state) => {
      // Update index for files with saved content
      Object.keys(state.versions).forEach((filePath) => {
        const content = fsOperations.getFileContent(filePath)
        if (content) {
          searchIndexManager.updateFileIndex(filePath, content)
        }
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    searchIndexManager
      .searchContent(query, {
        caseSensitive,
        wholeWord,
        regex: useRegex,
      })
      .then((searchResults) => {
        setResults(searchResults)
        setIsSearching(false)

        // Auto-expand files with results
        const filesWithResults = new Set(searchResults.map((r) => r.filePath))
        setExpandedFiles(filesWithResults)
      })
  }, [query, caseSensitive, wholeWord, useRegex])

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath)
    } else {
      newExpanded.add(filePath)
    }
    setExpandedFiles(newExpanded)
  }

  const handleResultClick = (result: SearchResult) => {
    onFileOpen(result.filePath, result.line, result.column)
  }

  const highlightMatch = (text: string, matchStart: number, matchEnd: number) => {
    const before = text.slice(0, matchStart)
    const match = text.slice(matchStart, matchEnd)
    const after = text.slice(matchEnd)

    return (
      <>
        {before}
        <span className="bg-neo-fg text-neo-bg font-bold px-1 rounded">{match}</span>
        {after}
      </>
    )
  }

  // Group results by file
  const resultsByFile = results.reduce(
    (acc, result) => {
      if (!acc[result.filePath]) {
        acc[result.filePath] = []
      }
      acc[result.filePath].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  const stats = searchIndexManager.getIndexStats()

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg flex flex-col">
      {/* Header */}
      <div className="p-3 border-b-2 border-neo-fg">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-3">Global Search</h3>

        {/* Search Input */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neo-fg opacity-60" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in files..."
              className="w-full pl-8 pr-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg placeholder-neo-fg placeholder-opacity-60 outline-none focus:border-neo-fg"
            />
          </div>
        </div>

        {/* Search Options */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-neo-fg">Aa</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-neo-fg">Ab</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-neo-fg">.*</span>
          </label>
        </div>

        {/* Stats */}
        <div className="mt-2 text-xs text-neo-fg opacity-60">
          {isSearching ? "Searching..." : `${results.length} results in ${Object.keys(resultsByFile).length} files`}
          {" • "}
          {stats.fileCount} files indexed
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(resultsByFile).length === 0 && query ? (
          <div className="p-4 text-center text-neo-fg opacity-60">
            {isSearching ? "Searching..." : "No results found"}
          </div>
        ) : (
          Object.entries(resultsByFile).map(([filePath, fileResults]) => {
            const fileName = filePath.split("/").pop() || filePath
            const isExpanded = expandedFiles.has(filePath)

            return (
              <div key={filePath} className="border-b border-neo-fg border-opacity-20">
                {/* File Header */}
                <div
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-neo-bg2"
                  onClick={() => toggleFileExpansion(filePath)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neo-fg" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neo-fg" />
                  )}
                  <FileText className="w-4 h-4 text-neo-fg" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neo-fg truncate">{fileName}</div>
                    <div className="text-xs text-neo-fg opacity-60 truncate">{filePath}</div>
                  </div>
                  <span className="text-xs text-neo-fg opacity-60">{fileResults.length}</span>
                </div>

                {/* File Results */}
                {isExpanded && (
                  <div className="ml-6">
                    {fileResults.map((result, index) => (
                      <div
                        key={`${result.filePath}-${result.line}-${index}`}
                        className="p-2 cursor-pointer hover:bg-neo-bg2 border-l-2 border-neo-fg border-opacity-20"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-neo-fg opacity-60">
                            {result.line}:{result.column}
                          </span>
                        </div>
                        <div className="text-sm text-neo-fg font-mono">
                          {highlightMatch(result.lineContent.trim(), result.matchStart, result.matchEnd)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
