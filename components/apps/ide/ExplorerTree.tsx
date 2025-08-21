"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from "lucide-react"
import type { FileNode } from "@/data/files"
import { FileSystemOperations, type FSState } from "@/lib/fs/operations"

interface ExplorerTreeProps {
  onFileSelect: (file: FileNode) => void
  selectedPath?: string
  onStateChange?: (state: Partial<FSState>) => void
}

export function ExplorerTree({ onFileSelect, selectedPath, onStateChange }: ExplorerTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))
  const [tree, setTree] = useState<FileNode[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Load initial tree from localStorage or use default
  useEffect(() => {
    const state = FileSystemOperations.loadState()
    if (state.tree.length > 0) {
      setTree(state.tree)
    } else {
      // Initialize with default tree structure
      const defaultTree: FileNode[] = [
        {
          type: "folder",
          name: "Playground",
          path: "/Playground",
          children: [],
        },
      ]
      setTree(defaultTree)
      FileSystemOperations.saveState({ tree: defaultTree })
    }
  }, [])

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingPath])

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, path })
  }

  const handleNewFile = (parentPath: string) => {
    try {
      const newTree = FileSystemOperations.createFile(tree, parentPath, "untitled.js")
      setTree(newTree)
      FileSystemOperations.saveState({ tree: newTree })
      onStateChange?.({ tree: newTree })

      // Start renaming the new file
      const newFilePath = `${parentPath}/untitled.js`.replace(/\/+/g, "/")
      setRenamingPath(newFilePath)
      setNewName("untitled.js")

      // Expand parent folder
      setExpandedFolders((prev) => new Set([...prev, parentPath]))
    } catch (error) {
      console.error("Failed to create file:", error)
    }
    setContextMenu(null)
  }

  const handleNewFolder = (parentPath: string) => {
    try {
      const newTree = FileSystemOperations.createFolder(tree, parentPath, "New Folder")
      setTree(newTree)
      FileSystemOperations.saveState({ tree: newTree })
      onStateChange?.({ tree: newTree })

      // Start renaming the new folder
      const newFolderPath = `${parentPath}/New Folder`.replace(/\/+/g, "/")
      setRenamingPath(newFolderPath)
      setNewName("New Folder")

      // Expand parent folder
      setExpandedFolders((prev) => new Set([...prev, parentPath]))
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
    setContextMenu(null)
  }

  const handleRename = (path: string) => {
    const node = findNodeInTree(tree, path)
    if (node) {
      setRenamingPath(path)
      setNewName(node.name)
    }
    setContextMenu(null)
  }

  const handleDelete = (path: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const newTree = FileSystemOperations.deleteNode(tree, path)
        setTree(newTree)
        FileSystemOperations.saveState({ tree: newTree })
        onStateChange?.({ tree: newTree })
      } catch (error) {
        console.error("Failed to delete:", error)
      }
    }
    setContextMenu(null)
  }

  const handleDuplicate = (path: string) => {
    try {
      const newTree = FileSystemOperations.duplicateNode(tree, path)
      setTree(newTree)
      FileSystemOperations.saveState({ tree: newTree })
      onStateChange?.({ tree: newTree })
    } catch (error) {
      console.error("Failed to duplicate:", error)
    }
    setContextMenu(null)
  }

  const confirmRename = () => {
    if (!renamingPath || !newName.trim()) return

    try {
      const newTree = FileSystemOperations.renameNode(tree, renamingPath, newName.trim())
      setTree(newTree)
      FileSystemOperations.saveState({ tree: newTree })
      onStateChange?.({ tree: newTree })
    } catch (error) {
      console.error("Failed to rename:", error)
      alert(error instanceof Error ? error.message : "Failed to rename")
    }

    setRenamingPath(null)
    setNewName("")
  }

  const cancelRename = () => {
    setRenamingPath(null)
    setNewName("")
  }

  const findNodeInTree = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findNodeInTree(node.children, path)
        if (found) return found
      }
    }
    return null
  }

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedPath === node.path
    const isRenaming = renamingPath === node.path
    const paddingLeft = depth * 16

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-neo-bg2 ${
            isSelected ? "bg-neo-bg3 border-l-2 border-neo-fg" : ""
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path)
            } else {
              onFileSelect(node)
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.path)}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-neo-fg" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neo-fg" />
              )}
              {isExpanded ? <FolderOpen className="w-4 h-4 text-neo-fg" /> : <Folder className="w-4 h-4 text-neo-fg" />}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-neo-fg" />
            </>
          )}

          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename()
                if (e.key === "Escape") cancelRename()
              }}
              onBlur={confirmRename}
              className="text-sm font-medium text-neo-fg bg-neo-bg border border-neo-fg px-1 flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium text-neo-fg truncate">{node.name}</span>
          )}

          {node.meta?.featured && <div className="w-2 h-2 bg-neo-fg rounded-full ml-auto" />}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg">
      <div className="px-3 py-2 border-b-2 border-neo-fg flex items-center justify-between">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Explorer</h3>
        <div className="flex gap-1">
          <button
            onClick={() => handleNewFile("/Playground")}
            className="w-6 h-6 flex items-center justify-center hover:bg-neo-bg2 border border-neo-fg"
            title="New File"
          >
            <Plus className="w-3 h-3 text-neo-fg" />
          </button>
          <button
            onClick={() => handleNewFolder("/Playground")}
            className="w-6 h-6 flex items-center justify-center hover:bg-neo-bg2 border border-neo-fg"
            title="New Folder"
          >
            <Folder className="w-3 h-3 text-neo-fg" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto">{tree.map((node) => renderNode(node))}</div>

      {contextMenu && (
        <div
          className="fixed bg-neo-bg border-2 border-neo-fg shadow-neo z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleNewFile(contextMenu.path)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            New File
          </button>
          <button
            onClick={() => handleNewFolder(contextMenu.path)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            New Folder
          </button>
          <hr className="border-neo-fg my-1" />
          <button
            onClick={() => handleRename(contextMenu.path)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            Rename
          </button>
          <button
            onClick={() => handleDuplicate(contextMenu.path)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            Duplicate
          </button>
          <button
            onClick={() => handleDelete(contextMenu.path)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
