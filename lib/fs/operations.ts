import type { FileNode } from "@/data/files"

export interface FSState {
  tree: FileNode[]
  openTabs: Tab[]
  activePath: string | null
  selection: string[]
  versions: Record<string, { ts: number; content: string }[]>
  dirtyTabs?: Record<string, boolean>
}

export interface Tab {
  path: string
  pane: number
  pinned: boolean
  isPreview: boolean
}

class FileSystemOperations {
  private static instance: FileSystemOperations
  private state: FSState
  private listeners: Set<(state: FSState) => void> = new Set()

  private constructor() {
    this.state = this.loadState()
  }

  static getInstance(): FileSystemOperations {
    if (!FileSystemOperations.instance) {
      FileSystemOperations.instance = new FileSystemOperations()
    }
    return FileSystemOperations.instance
  }

  private loadState(): FSState {
    try {
      const saved = localStorage.getItem("neo.ide.fs.state")
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load FS state:", error)
    }

    return {
      tree: [],
      openTabs: [],
      activePath: null,
      selection: [],
      versions: {},
    }
  }

  private saveState() {
    try {
      localStorage.setItem("neo.ide.fs.state", JSON.stringify(this.state))
      this.notifyListeners()
    } catch (error) {
      console.error("Failed to save FS state:", error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: (state: FSState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState(): FSState {
    return { ...this.state }
  }

  createFile(parentPath: string, name: string, content = "", templateId?: string): boolean {
    const newPath = `${parentPath}/${name}`

    // Check if file already exists
    if (this.findNodeByPath(newPath)) {
      throw new Error(`File "${name}" already exists`)
    }

    // Validate file name
    if (!this.isValidFileName(name)) {
      throw new Error("Invalid file name")
    }

    const language = this.getLanguageFromExtension(name)
    const newFile: FileNode = {
      type: "file",
      name,
      path: newPath,
      content,
      language,
      meta: templateId ? { kind: "playground", templateId } : undefined,
    }

    // Add to parent folder
    const parent = this.findNodeByPath(parentPath)
    if (!parent || parent.type !== "folder") {
      throw new Error("Parent folder not found")
    }

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(newFile)
    parent.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    this.saveState()
    return true
  }

  createFolder(parentPath: string, name: string): boolean {
    const newPath = `${parentPath}/${name}`

    if (this.findNodeByPath(newPath)) {
      throw new Error(`Folder "${name}" already exists`)
    }

    if (!this.isValidFileName(name)) {
      throw new Error("Invalid folder name")
    }

    const newFolder: FileNode = {
      type: "folder",
      name,
      path: newPath,
      children: [],
    }

    const parent = this.findNodeByPath(parentPath)
    if (!parent || parent.type !== "folder") {
      throw new Error("Parent folder not found")
    }

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(newFolder)
    parent.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    this.saveState()
    return true
  }

  renameNode(path: string, newName: string): boolean {
    const node = this.findNodeByPath(path)
    if (!node) {
      throw new Error("File or folder not found")
    }

    if (!this.isValidFileName(newName)) {
      throw new Error("Invalid name")
    }

    const parentPath = path.substring(0, path.lastIndexOf("/"))
    const newPath = `${parentPath}/${newName}`

    if (newPath !== path && this.findNodeByPath(newPath)) {
      throw new Error(`"${newName}" already exists`)
    }

    // Update node
    const oldPath = node.path
    node.name = newName
    node.path = newPath

    // Update language if file extension changed
    if (node.type === "file") {
      node.language = this.getLanguageFromExtension(newName)
    }

    // Update children paths recursively
    if (node.type === "folder") {
      this.updateChildrenPaths(node, oldPath, newPath)
    }

    // Update tabs
    this.state.openTabs = this.state.openTabs.map((tab) => ({
      ...tab,
      path: tab.path === oldPath ? newPath : tab.path,
    }))

    if (this.state.activePath === oldPath) {
      this.state.activePath = newPath
    }

    // Update dirty tabs
    if (this.state.dirtyTabs && this.state.dirtyTabs[oldPath]) {
      this.state.dirtyTabs[newPath] = this.state.dirtyTabs[oldPath]
      delete this.state.dirtyTabs[oldPath]
    }

    this.saveState()
    return true
  }

  deleteNode(path: string): boolean {
    const node = this.findNodeByPath(path)
    if (!node) {
      throw new Error("File or folder not found")
    }

    const parentPath = path.substring(0, path.lastIndexOf("/"))
    const parent = this.findNodeByPath(parentPath)
    if (!parent || !parent.children) {
      throw new Error("Parent folder not found")
    }

    // Remove from parent
    parent.children = parent.children.filter((child) => child.path !== path)

    // Close related tabs
    this.state.openTabs = this.state.openTabs.filter((tab) => !tab.path.startsWith(path))

    // Update active path if needed
    if (this.state.activePath?.startsWith(path)) {
      this.state.activePath = null
    }

    // Remove from versions
    Object.keys(this.state.versions).forEach((versionPath) => {
      if (versionPath.startsWith(path)) {
        delete this.state.versions[versionPath]
      }
    })

    // Remove from dirty tabs
    if (this.state.dirtyTabs) {
      delete this.state.dirtyTabs[path]
    }

    this.saveState()
    return true
  }

  duplicateNode(path: string): boolean {
    const node = this.findNodeByPath(path)
    if (!node) {
      throw new Error("File or folder not found")
    }

    const parentPath = path.substring(0, path.lastIndexOf("/"))
    const baseName = node.name
    const extension = node.type === "file" ? baseName.substring(baseName.lastIndexOf(".")) : ""
    const nameWithoutExt = node.type === "file" ? baseName.substring(0, baseName.lastIndexOf(".")) : baseName

    // Find unique name
    let counter = 2
    let newName = node.type === "file" ? `${nameWithoutExt} (${counter})${extension}` : `${baseName} (${counter})`

    while (this.findNodeByPath(`${parentPath}/${newName}`)) {
      counter++
      newName = node.type === "file" ? `${nameWithoutExt} (${counter})${extension}` : `${baseName} (${counter})`
    }

    // Create duplicate
    const duplicate = this.cloneNode(node, `${parentPath}/${newName}`, newName)

    const parent = this.findNodeByPath(parentPath)
    if (!parent || !parent.children) {
      throw new Error("Parent folder not found")
    }

    parent.children.push(duplicate)
    parent.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    this.saveState()
    return true
  }

  openFile(path: string, asPreview = true): void {
    const existingTabIndex = this.state.openTabs.findIndex((tab) => tab.path === path)

    if (existingTabIndex >= 0) {
      // File already open, just activate it
      this.state.activePath = path
      if (!asPreview) {
        // Pin the tab if opening as non-preview
        this.state.openTabs[existingTabIndex].pinned = true
        this.state.openTabs[existingTabIndex].isPreview = false
      }
    } else {
      // Close existing preview tab if opening new preview
      if (asPreview) {
        const previewTabIndex = this.state.openTabs.findIndex((tab) => tab.isPreview && !tab.pinned)
        if (previewTabIndex >= 0) {
          this.state.openTabs.splice(previewTabIndex, 1)
        }
      }

      // Create new tab
      const newTab: Tab = {
        path,
        pane: 1,
        pinned: !asPreview,
        isPreview: asPreview,
      }

      this.state.openTabs.push(newTab)
      this.state.activePath = path
    }

    this.saveState()
  }

  pinTab(path: string): void {
    const tab = this.state.openTabs.find((tab) => tab.path === path)
    if (tab) {
      tab.pinned = true
      tab.isPreview = false
      this.saveState()
    }
  }

  closeTab(path: string): void {
    this.state.openTabs = this.state.openTabs.filter((tab) => tab.path !== path)

    if (this.state.activePath === path) {
      // Set new active tab
      const remainingTabs = this.state.openTabs
      this.state.activePath = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].path : null
    }

    // Remove from dirty tabs
    if (this.state.dirtyTabs) {
      delete this.state.dirtyTabs[path]
    }

    this.saveState()
  }

  updateState(newState: Partial<FSState>): void {
    this.state = { ...this.state, ...newState }
    this.saveState()
  }

  markTabDirty(path: string, isDirty: boolean): void {
    const tab = this.state.openTabs.find((tab) => tab.path === path)
    if (tab) {
      // Store dirty state in a separate map since Tab interface doesn't have dirty field
      if (!this.state.dirtyTabs) {
        this.state.dirtyTabs = {}
      }
      this.state.dirtyTabs[path] = isDirty
      this.saveState()
    }
  }

  getDirtyState(path: string): boolean {
    return this.state.dirtyTabs?.[path] || false
  }

  saveFileContent(path: string, content: string): void {
    // Save to versions history
    if (!this.state.versions[path]) {
      this.state.versions[path] = []
    }

    const versions = this.state.versions[path]
    const lastVersion = versions[versions.length - 1]

    // Only save if content has changed
    if (!lastVersion || lastVersion.content !== content) {
      versions.push({
        ts: Date.now(),
        content,
      })

      // Keep only last 10 versions
      if (versions.length > 10) {
        versions.splice(0, versions.length - 10)
      }

      this.state.versions[path] = versions
    }

    // Mark tab as clean after save
    this.markTabDirty(path, false)
    this.saveState()
  }

  getFileContent(path: string): string | null {
    const versions = this.state.versions[path]
    if (versions && versions.length > 0) {
      return versions[versions.length - 1].content
    }
    return null
  }

  private findNodeByPath(path: string, nodes: FileNode[] = this.state.tree): FileNode | null {
    for (const node of nodes) {
      if (node.path === path) {
        return node
      }
      if (node.children) {
        const found = this.findNodeByPath(path, node.children)
        if (found) return found
      }
    }
    return null
  }

  private updateChildrenPaths(node: FileNode, oldBasePath: string, newBasePath: string): void {
    if (node.children) {
      for (const child of node.children) {
        child.path = child.path.replace(oldBasePath, newBasePath)
        if (child.type === "folder") {
          this.updateChildrenPaths(child, oldBasePath, newBasePath)
        }
      }
    }
  }

  private cloneNode(node: FileNode, newPath: string, newName: string): FileNode {
    const clone: FileNode = {
      ...node,
      path: newPath,
      name: newName,
    }

    if (node.children) {
      clone.children = node.children.map((child) => {
        const childNewPath = `${newPath}/${child.name}`
        return this.cloneNode(child, childNewPath, child.name)
      })
    }

    return clone
  }

  private isValidFileName(name: string): boolean {
    if (!name || name.trim() === "") return false
    if (name.includes("/") || name.includes("\\")) return false
    if (name === "." || name === "..") return false
    return true
  }

  private getLanguageFromExtension(filename: string): FileNode["language"] {
    const ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase()
    switch (ext) {
      case "js":
        return "js"
      case "ts":
        return "ts"
      case "html":
        return "html"
      case "css":
        return "css"
      case "md":
        return "md"
      case "json":
        return "json"
      default:
        return undefined
    }
  }
}

export const fsOperations = FileSystemOperations.getInstance()
