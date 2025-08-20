export interface FileVersion {
  ts: number
  content: string
}

export class HistoryStore {
  private static readonly VERSIONS_KEY = "neo.ide.fs.versions"
  private static readonly MAX_VERSIONS = 10

  static saveVersion(path: string, content: string): void {
    try {
      const versions = this.getVersions(path)
      const newVersion: FileVersion = {
        ts: Date.now(),
        content,
      }

      versions.push(newVersion)

      // Keep only the latest MAX_VERSIONS
      if (versions.length > this.MAX_VERSIONS) {
        versions.splice(0, versions.length - this.MAX_VERSIONS)
      }

      const allVersions = this.getAllVersions()
      allVersions[path] = versions

      localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(allVersions))
    } catch (error) {
      console.warn("Failed to save version:", error)
    }
  }

  static getVersions(path: string): FileVersion[] {
    try {
      const allVersions = this.getAllVersions()
      return allVersions[path] || []
    } catch (error) {
      console.warn("Failed to get versions:", error)
      return []
    }
  }

  static getAllVersions(): Record<string, FileVersion[]> {
    try {
      const stored = localStorage.getItem(this.VERSIONS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn("Failed to get all versions:", error)
      return {}
    }
  }

  static revertToVersion(path: string, timestamp: number): string | null {
    try {
      const versions = this.getVersions(path)
      const version = versions.find((v) => v.ts === timestamp)
      return version ? version.content : null
    } catch (error) {
      console.warn("Failed to revert version:", error)
      return null
    }
  }

  static clearVersions(path: string): void {
    try {
      const allVersions = this.getAllVersions()
      delete allVersions[path]
      localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(allVersions))
    } catch (error) {
      console.warn("Failed to clear versions:", error)
    }
  }
}
