export interface FileVersion {
  ts: number
  content: string
  description?: string
}

export interface HistoryState {
  versions: Record<string, FileVersion[]>
  maxVersions: number
}

class HistoryStore {
  private static instance: HistoryStore
  private state: HistoryState
  private listeners: Set<(state: HistoryState) => void> = new Set()

  private constructor() {
    this.state = this.loadState()
  }

  static getInstance(): HistoryStore {
    if (!HistoryStore.instance) {
      HistoryStore.instance = new HistoryStore()
    }
    return HistoryStore.instance
  }

  private loadState(): HistoryState {
    try {
      const saved = localStorage.getItem("neo.ide.history")
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load history state:", error)
    }

    return {
      versions: {},
      maxVersions: 10,
    }
  }

  private saveState() {
    try {
      localStorage.setItem("neo.ide.history", JSON.stringify(this.state))
      this.notifyListeners()
    } catch (error) {
      console.error("Failed to save history state:", error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: (state: HistoryState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  addVersion(filePath: string, content: string, description?: string): void {
    if (!this.state.versions[filePath]) {
      this.state.versions[filePath] = []
    }

    const versions = this.state.versions[filePath]
    const lastVersion = versions[versions.length - 1]

    // Only add if content has changed
    if (!lastVersion || lastVersion.content !== content) {
      const newVersion: FileVersion = {
        ts: Date.now(),
        content,
        description: description || `Auto-save ${new Date().toLocaleTimeString()}`,
      }

      versions.push(newVersion)

      // Keep only maxVersions
      if (versions.length > this.state.maxVersions) {
        versions.splice(0, versions.length - this.state.maxVersions)
      }

      this.saveState()
    }
  }

  getVersions(filePath: string): FileVersion[] {
    return this.state.versions[filePath] || []
  }

  getCurrentVersion(filePath: string): FileVersion | null {
    const versions = this.getVersions(filePath)
    return versions.length > 0 ? versions[versions.length - 1] : null
  }

  revertToVersion(filePath: string, timestamp: number): string | null {
    const versions = this.getVersions(filePath)
    const targetVersion = versions.find((v) => v.ts === timestamp)

    if (targetVersion) {
      // Add the reverted content as a new version
      this.addVersion(filePath, targetVersion.content, `Reverted to ${new Date(timestamp).toLocaleString()}`)
      return targetVersion.content
    }

    return null
  }

  deleteHistory(filePath: string): void {
    delete this.state.versions[filePath]
    this.saveState()
  }

  // Simple diff implementation
  generateDiff(oldContent: string, newContent: string): DiffLine[] {
    const oldLines = oldContent.split("\n")
    const newLines = newContent.split("\n")
    const diff: DiffLine[] = []

    const maxLines = Math.max(oldLines.length, newLines.length)

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i]
      const newLine = newLines[i]

      if (oldLine === undefined) {
        // Added line
        diff.push({
          type: "added",
          lineNumber: i + 1,
          content: newLine,
        })
      } else if (newLine === undefined) {
        // Removed line
        diff.push({
          type: "removed",
          lineNumber: i + 1,
          content: oldLine,
        })
      } else if (oldLine !== newLine) {
        // Modified line
        diff.push({
          type: "removed",
          lineNumber: i + 1,
          content: oldLine,
        })
        diff.push({
          type: "added",
          lineNumber: i + 1,
          content: newLine,
        })
      } else {
        // Unchanged line
        diff.push({
          type: "unchanged",
          lineNumber: i + 1,
          content: oldLine,
        })
      }
    }

    return diff
  }
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged"
  lineNumber: number
  content: string
}

export const historyStore = HistoryStore.getInstance()
