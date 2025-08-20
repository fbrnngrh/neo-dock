export interface SearchIndex {
  filePath: string
  content: string
  lines: string[]
  lastModified: number
}

export interface SearchResult {
  filePath: string
  fileName: string
  line: number
  column: number
  lineContent: string
  matchStart: number
  matchEnd: number
  context: {
    before: string[]
    after: string[]
  }
}

class SearchIndexManager {
  private static instance: SearchIndexManager
  private index: Map<string, SearchIndex> = new Map()
  private debounceTimeout: NodeJS.Timeout | null = null

  static getInstance(): SearchIndexManager {
    if (!SearchIndexManager.instance) {
      SearchIndexManager.instance = new SearchIndexManager()
    }
    return SearchIndexManager.instance
  }

  updateFileIndex(filePath: string, content: string): void {
    const lines = content.split("\n")
    const searchIndex: SearchIndex = {
      filePath,
      content,
      lines,
      lastModified: Date.now(),
    }

    this.index.set(filePath, searchIndex)
  }

  removeFileIndex(filePath: string): void {
    this.index.delete(filePath)
  }

  searchContent(
    query: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      regex?: boolean
    } = {},
  ): Promise<SearchResult[]> {
    return new Promise((resolve) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout)
      }

      this.debounceTimeout = setTimeout(() => {
        const results = this.performSearch(query, options)
        resolve(results)
      }, 300) // 300ms debounce
    })
  }

  private performSearch(
    query: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      regex?: boolean
    },
  ): SearchResult[] {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchQuery = options.caseSensitive ? query : query.toLowerCase()

    for (const [filePath, searchIndex] of this.index) {
      const fileName = filePath.split("/").pop() || filePath

      searchIndex.lines.forEach((line, lineIndex) => {
        const searchLine = options.caseSensitive ? line : line.toLowerCase()

        if (options.regex) {
          try {
            const regex = new RegExp(query, options.caseSensitive ? "g" : "gi")
            let match
            while ((match = regex.exec(searchLine)) !== null) {
              results.push(
                this.createSearchResult(filePath, fileName, lineIndex, match.index, match[0].length, searchIndex.lines),
              )
            }
          } catch (error) {
            // Invalid regex, skip
          }
        } else {
          let searchPattern = searchQuery
          if (options.wholeWord) {
            searchPattern = `\\b${searchQuery}\\b`
          }

          const regex = new RegExp(searchPattern, "gi")
          let match
          while ((match = regex.exec(searchLine)) !== null) {
            results.push(
              this.createSearchResult(filePath, fileName, lineIndex, match.index, match[0].length, searchIndex.lines),
            )
          }
        }
      })
    }

    return results.slice(0, 100) // Limit results
  }

  private createSearchResult(
    filePath: string,
    fileName: string,
    lineIndex: number,
    matchStart: number,
    matchLength: number,
    allLines: string[],
  ): SearchResult {
    const contextSize = 2
    const before = allLines.slice(Math.max(0, lineIndex - contextSize), lineIndex)
    const after = allLines.slice(lineIndex + 1, Math.min(allLines.length, lineIndex + 1 + contextSize))

    return {
      filePath,
      fileName,
      line: lineIndex + 1, // 1-based line numbers
      column: matchStart + 1, // 1-based column numbers
      lineContent: allLines[lineIndex],
      matchStart,
      matchEnd: matchStart + matchLength,
      context: {
        before,
        after,
      },
    }
  }

  getIndexStats(): { fileCount: number; totalLines: number } {
    let totalLines = 0
    for (const searchIndex of this.index.values()) {
      totalLines += searchIndex.lines.length
    }

    return {
      fileCount: this.index.size,
      totalLines,
    }
  }
}

export const searchIndexManager = SearchIndexManager.getInstance()
