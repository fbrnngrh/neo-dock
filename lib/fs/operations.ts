import type { FileNode } from "@/data/files"

export interface FSState {
  tree: FileNode[]
  openTabs: Tab[]
  activePath: string | null
  selection: string[]
  versions: Record<string, { ts: number; content: string }[]>
}

export interface Tab {
  path: string
  pane: number
  pinned: boolean
  isPreview: boolean
}

export class FileSystemOperations {
  private static STORAGE_KEY = "neo.ide.fs.tree"
  private static VERSIONS_KEY = "neo.ide.fs.versions"
  private static TABS_KEY = "neo.ide.fs.tabs"

  static loadState(): FSState {
    try {
      const tree = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]")
      const versions = JSON.parse(localStorage.getItem(this.VERSIONS_KEY) || "{}")
      const tabs = JSON.parse(localStorage.getItem(this.TABS_KEY) || "[]")

      return {
        tree: tree.length > 0 ? tree : [],
        openTabs: tabs,
        activePath: null,
        selection: [],
        versions,
      }
    } catch {
      return {
        tree: [],
        openTabs: [],
        activePath: null,
        selection: [],
        versions: {},
      }
    }
  }

  static saveState(state: Partial<FSState>) {
    try {
      if (state.tree) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state.tree))
      }
      if (state.versions) {
        localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(state.versions))
      }
      if (state.openTabs) {
        localStorage.setItem(this.TABS_KEY, JSON.stringify(state.openTabs))
      }
    } catch (error) {
      console.error("Failed to save file system state:", error)
    }
  }

  static createFile(tree: FileNode[], parentPath: string, name: string, content = ""): FileNode[] {
    const newTree = JSON.parse(JSON.stringify(tree))
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || parent.type !== "folder") {
      throw new Error("Parent folder not found")
    }

    const filePath = `${parentPath}/${name}`.replace(/\/+/g, "/")

    // Check for duplicate names
    if (parent.children?.some((child) => child.name === name)) {
      throw new Error("File with this name already exists")
    }

    const newFile: FileNode = {
      type: "file",
      name,
      path: filePath,
      content,
      language: this.getLanguageFromExtension(name),
      meta: { kind: "playground" },
    }

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(newFile)

    return newTree
  }

  static createFolder(tree: FileNode[], parentPath: string, name: string): FileNode[] {
    const newTree = JSON.parse(JSON.stringify(tree))
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || parent.type !== "folder") {
      throw new Error("Parent folder not found")
    }

    const folderPath = `${parentPath}/${name}`.replace(/\/+/g, "/")

    // Check for duplicate names
    if (parent.children?.some((child) => child.name === name)) {
      throw new Error("Folder with this name already exists")
    }

    const newFolder: FileNode = {
      type: "folder",
      name,
      path: folderPath,
      children: [],
    }

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(newFolder)

    return newTree
  }

  static renameNode(tree: FileNode[], oldPath: string, newName: string): FileNode[] {
    const newTree = JSON.parse(JSON.stringify(tree))
    const node = this.findNodeByPath(newTree, oldPath)

    if (!node) {
      throw new Error("Node not found")
    }

    // Validate new name
    if (!this.isValidFileName(newName)) {
      throw new Error("Invalid file name")
    }

    const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/"))
    const newPath = `${parentPath}/${newName}`.replace(/\/+/g, "/")

    // Check for duplicate names in parent
    const parent = parentPath ? this.findNodeByPath(newTree, parentPath) : { children: newTree }
    if (parent?.children?.some((child) => child.name === newName && child.path !== oldPath)) {
      throw new Error("Name already exists")
    }

    // Update node
    node.name = newName
    node.path = newPath
    if (node.type === "file") {
      node.language = this.getLanguageFromExtension(newName)
    }

    // Update all descendant paths
    this.updateDescendantPaths(node, oldPath, newPath)

    return newTree
  }

  static deleteNode(tree: FileNode[], path: string): FileNode[] {
    const newTree = JSON.parse(JSON.stringify(tree))
    const parentPath = path.substring(0, path.lastIndexOf("/"))
    const parent = parentPath ? this.findNodeByPath(newTree, parentPath) : { children: newTree }

    if (!parent?.children) {
      throw new Error("Parent not found")
    }

    parent.children = parent.children.filter((child) => child.path !== path)
    return newTree
  }

  static duplicateNode(tree: FileNode[], path: string): FileNode[] {
    const newTree = JSON.parse(JSON.stringify(tree))
    const node = this.findNodeByPath(newTree, path)

    if (!node) {
      throw new Error("Node not found")
    }

    const parentPath = path.substring(0, path.lastIndexOf("/"))
    const parent = parentPath ? this.findNodeByPath(newTree, parentPath) : { children: newTree }

    if (!parent?.children) {
      throw new Error("Parent not found")
    }

    // Generate unique name
    let copyName = `${node.name} (2)`
    let counter = 2
    while (parent.children.some((child) => child.name === copyName)) {
      counter++
      copyName = `${node.name} (${counter})`
    }

    const copyPath = `${parentPath}/${copyName}`.replace(/\/+/g, "/")
    const copy = JSON.parse(JSON.stringify(node))
    copy.name = copyName
    copy.path = copyPath

    // Update all descendant paths
    this.updateDescendantPaths(copy, path, copyPath)

    parent.children.push(copy)
    return newTree
  }

  static saveFileContent(path: string, content: string, versions: Record<string, { ts: number; content: string }[]>) {
    const newVersions = { ...versions }

    if (!newVersions[path]) {
      newVersions[path] = []
    }

    // Add new version
    newVersions[path].unshift({
      ts: Date.now(),
      content,
    })

    // Keep only last 10 versions
    if (newVersions[path].length > 10) {
      newVersions[path] = newVersions[path].slice(0, 10)
    }

    return newVersions
  }

  private static findNodeByPath(tree: FileNode[] | FileNode, path: string): FileNode | null {
    const nodes = Array.isArray(tree) ? tree : [tree]

    for (const node of nodes) {
      if (node.path === path) {
        return node
      }

      if (node.children) {
        const found = this.findNodeByPath(node.children, path)
        if (found) return found
      }
    }

    return null
  }

  private static updateDescendantPaths(node: FileNode, oldBasePath: string, newBasePath: string) {
    if (node.children) {
      for (const child of node.children) {
        child.path = child.path.replace(oldBasePath, newBasePath)
        this.updateDescendantPaths(child, oldBasePath, newBasePath)
      }
    }
  }

  private static getLanguageFromExtension(filename: string): FileNode["language"] {
    const ext = filename.split(".").pop()?.toLowerCase()
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
      default:
        return undefined
    }
  }

  private static isValidFileName(name: string): boolean {
    return /^[^<>:"/\\|?*\x00-\x1f]+$/.test(name) && name.trim() === name
  }
}
