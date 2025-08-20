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

export class FSOperations {
  private static readonly STORAGE_KEY = "neo.ide.fs.tree"
  private static readonly VERSIONS_KEY = "neo.ide.fs.versions"
  private static readonly TABS_KEY = "neo.ide.tabs"

  static validateFileName(name: string): { valid: boolean; error?: string } {
    if (!name.trim()) {
      return { valid: false, error: "Name cannot be empty" }
    }

    if (name.includes("/") || name.includes("\\")) {
      return { valid: false, error: "Name cannot contain slashes" }
    }

    if (name.startsWith(".")) {
      return { valid: false, error: "Name cannot start with a dot" }
    }

    return { valid: true }
  }

  static isPathUnique(path: string, tree: FileNode[], excludePath?: string): boolean {
    const allPaths = this.getAllPaths(tree)
    return !allPaths.some((p) => p === path && p !== excludePath)
  }

  static getAllPaths(nodes: FileNode[]): string[] {
    const paths: string[] = []

    function traverse(node: FileNode) {
      paths.push(node.path)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    nodes.forEach(traverse)
    return paths
  }

  static createFile(
    tree: FileNode[],
    parentPath: string,
    name: string,
    content = "",
    language?: "js" | "ts" | "html" | "css" | "md",
  ): { success: boolean; error?: string; newTree?: FileNode[] } {
    const validation = this.validateFileName(name)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const newPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`

    if (!this.isPathUnique(newPath, tree)) {
      return { success: false, error: "File already exists" }
    }

    const newTree = this.cloneTree(tree)
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || parent.type !== "folder") {
      return { success: false, error: "Parent folder not found" }
    }

    const newFile: FileNode = {
      type: "file",
      name,
      path: newPath,
      content,
      language,
      meta: { kind: "playground" },
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

    return { success: true, newTree }
  }

  static createFolder(
    tree: FileNode[],
    parentPath: string,
    name: string,
  ): { success: boolean; error?: string; newTree?: FileNode[] } {
    const validation = this.validateFileName(name)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const newPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`

    if (!this.isPathUnique(newPath, tree)) {
      return { success: false, error: "Folder already exists" }
    }

    const newTree = this.cloneTree(tree)
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || parent.type !== "folder") {
      return { success: false, error: "Parent folder not found" }
    }

    const newFolder: FileNode = {
      type: "folder",
      name,
      path: newPath,
      children: [],
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

    return { success: true, newTree }
  }

  static renameNode(
    tree: FileNode[],
    oldPath: string,
    newName: string,
  ): { success: boolean; error?: string; newTree?: FileNode[] } {
    const validation = this.validateFileName(newName)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const newTree = this.cloneTree(tree)
    const node = this.findNodeByPath(newTree, oldPath)

    if (!node) {
      return { success: false, error: "Node not found" }
    }

    const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/"
    const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`

    if (!this.isPathUnique(newPath, newTree, oldPath)) {
      return { success: false, error: "Name already exists" }
    }

    // Update node and all descendants
    this.updateNodePaths(node, oldPath, newPath)
    node.name = newName

    return { success: true, newTree }
  }

  static deleteNode(tree: FileNode[], path: string): { success: boolean; error?: string; newTree?: FileNode[] } {
    const newTree = this.cloneTree(tree)
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/"
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || !parent.children) {
      return { success: false, error: "Parent not found" }
    }

    const nodeIndex = parent.children.findIndex((child) => child.path === path)
    if (nodeIndex === -1) {
      return { success: false, error: "Node not found" }
    }

    parent.children.splice(nodeIndex, 1)
    return { success: true, newTree }
  }

  static duplicateNode(tree: FileNode[], path: string): { success: boolean; error?: string; newTree?: FileNode[] } {
    const newTree = this.cloneTree(tree)
    const node = this.findNodeByPath(newTree, path)

    if (!node) {
      return { success: false, error: "Node not found" }
    }

    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/"
    const parent = this.findNodeByPath(newTree, parentPath)

    if (!parent || parent.type !== "folder") {
      return { success: false, error: "Parent folder not found" }
    }

    // Generate unique name
    let copyName = `${node.name} (2)`
    let counter = 2
    let copyPath = parentPath === "/" ? `/${copyName}` : `${parentPath}/${copyName}`

    while (!this.isPathUnique(copyPath, newTree)) {
      counter++
      copyName = `${node.name} (${counter})`
      copyPath = parentPath === "/" ? `/${copyName}` : `${parentPath}/${copyName}`
    }

    // Clone the node and update paths
    const clonedNode = this.cloneNode(node)
    this.updateNodePaths(clonedNode, node.path, copyPath)
    clonedNode.name = copyName

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(clonedNode)
    parent.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return { success: true, newTree }
  }

  private static cloneTree(tree: FileNode[]): FileNode[] {
    return tree.map((node) => this.cloneNode(node))
  }

  private static cloneNode(node: FileNode): FileNode {
    return {
      ...node,
      children: node.children ? node.children.map((child) => this.cloneNode(child)) : undefined,
    }
  }

  private static findNodeByPath(tree: FileNode[], path: string): FileNode | null {
    function search(nodes: FileNode[]): FileNode | null {
      for (const node of nodes) {
        if (node.path === path) return node
        if (node.children) {
          const found = search(node.children)
          if (found) return found
        }
      }
      return null
    }

    return search(tree)
  }

  private static updateNodePaths(node: FileNode, oldPath: string, newPath: string): void {
    node.path = newPath

    if (node.children) {
      node.children.forEach((child) => {
        const childOldPath = child.path
        const childNewPath = childOldPath.replace(oldPath, newPath)
        this.updateNodePaths(child, childOldPath, childNewPath)
      })
    }
  }

  static saveToStorage(tree: FileNode[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tree))
    } catch (error) {
      console.warn("Failed to save tree to localStorage:", error)
    }
  }

  static loadFromStorage(): FileNode[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn("Failed to load tree from localStorage:", error)
      return null
    }
  }
}
