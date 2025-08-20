export class PlaygroundStorage {
  private static readonly PREFIX = "neo-ide-playground-"

  static saveFile(path: string, content: string): void {
    try {
      localStorage.setItem(this.PREFIX + path, content)
    } catch (error) {
      console.warn("Failed to save file to localStorage:", error)
    }
  }

  static loadFile(path: string): string | null {
    try {
      return localStorage.getItem(this.PREFIX + path)
    } catch (error) {
      console.warn("Failed to load file from localStorage:", error)
      return null
    }
  }

  static deleteFile(path: string): void {
    try {
      localStorage.removeItem(this.PREFIX + path)
    } catch (error) {
      console.warn("Failed to delete file from localStorage:", error)
    }
  }

  static getAllSavedFiles(): string[] {
    try {
      const keys = Object.keys(localStorage)
      return keys.filter((key) => key.startsWith(this.PREFIX)).map((key) => key.substring(this.PREFIX.length))
    } catch (error) {
      console.warn("Failed to get saved files from localStorage:", error)
      return []
    }
  }

  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.filter((key) => key.startsWith(this.PREFIX)).forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }

  static getStorageSize(): number {
    try {
      let total = 0
      const keys = Object.keys(localStorage)
      keys
        .filter((key) => key.startsWith(this.PREFIX))
        .forEach((key) => {
          const value = localStorage.getItem(key)
          if (value) {
            total += key.length + value.length
          }
        })
      return total
    } catch (error) {
      console.warn("Failed to calculate storage size:", error)
      return 0
    }
  }

  static isStorageFull(): boolean {
    const size = this.getStorageSize()
    const maxSize = 200 * 1024 // 200KB limit as per spec
    return size >= maxSize
  }
}
