"use client"

import type React from "react"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Edit3,
  Trash2,
  Copy,
} from "lucide-react"
import type { FileNode } from "@/data/files"
import { FSOperations } from "@/lib/fs/operations"

interface ExplorerTreeProps {
  tree: FileNode[]
  onTreeChange: (newTree: FileNode[]) => void
  onFileSelect: (file: FileNode) => void
  selectedPath?: string
  selection: string[]
  onSelectionChange: (selection: string[]) => void
}

export function ExplorerTree({
  tree,
  onTreeChange,
  onFileSelect,
  selectedPath,
  selection,
  onSelectionChange,
}: ExplorerTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

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

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const handleNewFile = (parentPath: string) => {
    const result = FSOperations.createFile(tree, parentPath, "untitled.js", "", "js")
    if (result.success && result.newTree) {
      onTreeChange(result.newTree)
      const newFilePath = parentPath === "/" ? "/untitled.js" : `${parentPath}/untitled.js`
      setRenamingPath(newFilePath)
      setNewName("untitled.js")
    } else {
      alert(result.error)
    }
    closeContextMenu()
  }

  const handleNewFolder = (parentPath: string) => {
    const result = FSOperations.createFolder(tree, parentPath, "New Folder")
    if (result.success && result.newTree) {
      onTreeChange(result.newTree)
      const newFolderPath = parentPath === "/" ? "/New Folder" : `${parentPath}/New Folder`
      setRenamingPath(newFolderPath)
      setNewName("New Folder")
    } else {
      alert(result.error)
    }
    closeContextMenu()
  }

  const handleRename = (path: string) => {
    const node = findNodeInTree(tree, path)
    if (node) {
      setRenamingPath(path)
      setNewName(node.name)
    }
    closeContextMenu()
  }

  const handleDelete = (path: string) => {
    const node = findNodeInTree(tree, path)
    if (!node) return

    const itemCount = node.type === "folder" ? countItems(node) : 1
    const message = itemCount > 1 ? `Delete ${node.name} and ${itemCount - 1} items inside it?` : `Delete ${node.name}?`

    if (confirm(message)) {
      const result = FSOperations.deleteNode(tree, path)
      if (result.success && result.newTree) {
        onTreeChange(result.newTree)
        // Remove from selection if selected
        onSelectionChange(selection.filter((p) => p !== path))
      } else {
        alert(result.error)
      }
    }
    closeContextMenu()
  }

  const handleDuplicate = (path: string) => {
    const result = FSOperations.duplicateNode(tree, path)
    if (result.success && result.newTree) {
      onTreeChange(result.newTree)
    } else {
      alert(result.error)
    }
    closeContextMenu()
  }

  const handleRenameSubmit = () => {
    if (!renamingPath) return

    const result = FSOperations.renameNode(tree, renamingPath, newName)
    if (result.success && result.newTree) {
      onTreeChange(result.newTree)
    } else {
      alert(result.error)
    }

    setRenamingPath(null)
    setNewName("")
  }

  const handleRenameCancel = () => {
    setRenamingPath(null)
    setNewName("")
  }

  const handleNodeClick = (node: FileNode, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      const newSelection = selection.includes(node.path)
        ? selection.filter((p) => p !== node.path)
        : [...selection, node.path]
      onSelectionChange(newSelection)
    } else if (e.shiftKey && selection.length > 0) {
      // Range select - simplified implementation
      const lastSelected = selection[selection.length - 1]
      const allPaths = FSOperations.getAllPaths(tree)
      const start = allPaths.indexOf(lastSelected)
      const end = allPaths.indexOf(node.path)
      const range = allPaths.slice(Math.min(start, end), Math.max(start, end) + 1)
      onSelectionChange(range)
    } else {
      // Single select
      onSelectionChange([node.path])
      if (node.type === "file") {
        onFileSelect(node)
      }
    }
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

  const countItems = (node: FileNode): number => {
    let count = 1
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countItems(child), 0)
    }
    return count
  }

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedPath === node.path
    const isInSelection = selection.includes(node.path)
    const isRenaming = renamingPath === node.path
    const paddingLeft = depth * 16

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-neo-bg2 ${
            isSelected ? "bg-neo-bg3 border-l-2 border-neo-fg" : ""
          } ${isInSelection ? "bg-neo-bg2" : ""}`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={(e) => {
            if (node.type === "folder" && !isRenaming) {
              toggleFolder(node.path)
            }
            handleNodeClick(node, e)
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
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit()
                if (e.key === "Escape") handleRenameCancel()
              }}
              className="flex-1 bg-neo-bg border border-neo-fg px-1 text-sm font-medium text-neo-fg"
              autoFocus
              onFocus={(e) => {
                // Select name without extension
                const dotIndex = e.target.value.lastIndexOf(".")
                if (dotIndex > 0) {
                  e.target.setSelectionRange(0, dotIndex)
                } else {
                  e.target.select()
                }
              }}
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

  return (
    <>
      <div className="h-full bg-neo-bg border-r-2 border-neo-fg">
        <div className="px-3 py-2 border-b-2 border-neo-fg flex items-center justify-between">
          <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Explorer</h3>
          <div className="flex gap-1">
            <button
              onClick={() => handleNewFile("/")}
              className="w-6 h-6 flex items-center justify-center hover:bg-neo-bg2 border border-neo-fg"
              title="New File"
            >
              <Plus className="w-3 h-3 text-neo-fg" />
            </button>
            <button
              onClick={() => handleNewFolder("/")}
              className="w-6 h-6 flex items-center justify-center hover:bg-neo-bg2 border border-neo-fg"
              title="New Folder"
            >
              <FolderPlus className="w-3 h-3 text-neo-fg" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto">{tree.map((node) => renderNode(node))}</div>
      </div>

      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
          <div
            className="fixed z-50 bg-neo-bg border-2 border-neo-fg shadow-neo min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            role="menu"
          >
            <button
              className="w-full px-3 py-2 text-left text-sm text-neo-fg hover:bg-neo-bg2 flex items-center gap-2"
              onClick={() => handleNewFile(contextMenu.path)}
              role="menuitem"
            >
              <Plus className="w-4 h-4" />
              New File
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm text-neo-fg hover:bg-neo-bg2 flex items-center gap-2"
              onClick={() => handleNewFolder(contextMenu.path)}
              role="menuitem"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <hr className="border-neo-fg" />
            <button
              className="w-full px-3 py-2 text-left text-sm text-neo-fg hover:bg-neo-bg2 flex items-center gap-2"
              onClick={() => handleRename(contextMenu.path)}
              role="menuitem"
            >
              <Edit3 className="w-4 h-4" />
              Rename
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm text-neo-fg hover:bg-neo-bg2 flex items-center gap-2"
              onClick={() => handleDuplicate(contextMenu.path)}
              role="menuitem"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm text-neo-fg hover:bg-neo-bg2 flex items-center gap-2"
              onClick={() => handleDelete(contextMenu.path)}
              role="menuitem"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  )
}
