"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from "lucide-react"
import type { FileNode } from "@/data/files"
import { fsOperations, type FSState } from "@/lib/fs/operations"

interface ExplorerTreeProps {
  onFileSelect: (file: FileNode, asPreview?: boolean) => void
  selectedPath?: string
  fileTree: FileNode
}

export function ExplorerTree({ onFileSelect, selectedPath, fileTree }: ExplorerTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null)
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [fsState, setFsState] = useState<FSState>(fsOperations.getState())
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null)
  const [dragOverNode, setDragOverNode] = useState<FileNode | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribe = fsOperations.subscribe(setFsState)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingPath])

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const handleNodeClick = (e: React.MouseEvent, node: FileNode) => {
    if (renamingPath) return

    // Handle multi-select
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedNodes)
      if (newSelected.has(node.path)) {
        newSelected.delete(node.path)
      } else {
        newSelected.add(node.path)
      }
      setSelectedNodes(newSelected)
      return
    }

    if (e.shiftKey && selectedNodes.size > 0) {
      // Range select - simplified implementation
      const newSelected = new Set(selectedNodes)
      newSelected.add(node.path)
      setSelectedNodes(newSelected)
      return
    }

    // Single select
    setSelectedNodes(new Set([node.path]))

    if (node.type === "folder") {
      toggleFolder(node.path)
    } else {
      const isDoubleClick = e.detail === 2
      onFileSelect(node, !isDoubleClick)
      if (!isDoubleClick) {
        fsOperations.openFile(node.path, true)
      } else {
        fsOperations.pinTab(node.path)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    setDraggedNode(node)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", node.path)
  }

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    if (node.type === "folder" && draggedNode && draggedNode.path !== node.path) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDragOverNode(node)
    }
  }

  const handleDragLeave = () => {
    setDragOverNode(null)
  }

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault()
    if (draggedNode && targetNode.type === "folder" && draggedNode.path !== targetNode.path) {
      try {
        // Move the dragged node to the target folder
        const newName = draggedNode.name
        const newPath = `${targetNode.path}/${newName}`

        // Check if target already exists
        if (findNodeByPath(newPath, fileTree)) {
          alert(`A ${draggedNode.type} named "${newName}" already exists in the target folder`)
          return
        }

        // This would require implementing a move operation in fsOperations
        // For now, we'll show a message
        console.log(`Moving ${draggedNode.path} to ${targetNode.path}`)
        alert("Drag & drop move functionality would be implemented here")
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to move")
      }
    }
    setDraggedNode(null)
    setDragOverNode(null)
  }

  const handleNewFile = (parentPath: string) => {
    try {
      const name = prompt("Enter file name:")
      if (name) {
        fsOperations.createFile(parentPath, name)
        setExpandedFolders((prev) => new Set([...prev, parentPath]))
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create file")
    }
    setContextMenu(null)
  }

  const handleNewFolder = (parentPath: string) => {
    try {
      const name = prompt("Enter folder name:")
      if (name) {
        fsOperations.createFolder(parentPath, name)
        setExpandedFolders((prev) => new Set([...prev, parentPath]))
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create folder")
    }
    setContextMenu(null)
  }

  const handleRename = (node: FileNode) => {
    setRenamingPath(node.path)
    setNewName(node.name)
    setContextMenu(null)
  }

  const handleRenameSubmit = () => {
    if (renamingPath && newName.trim()) {
      try {
        fsOperations.renameNode(renamingPath, newName.trim())
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to rename")
      }
    }
    setRenamingPath(null)
    setNewName("")
  }

  const handleRenameCancel = () => {
    setRenamingPath(null)
    setNewName("")
  }

  const handleDelete = (node: FileNode) => {
    const selectedCount = selectedNodes.size
    const itemType = selectedCount > 1 ? "items" : node.type === "folder" ? "folder" : "file"
    const message =
      selectedCount > 1
        ? `Are you sure you want to delete ${selectedCount} selected items?`
        : `Are you sure you want to delete this ${itemType}?`

    if (confirm(message)) {
      try {
        if (selectedCount > 1) {
          // Delete all selected nodes
          selectedNodes.forEach((path) => {
            fsOperations.deleteNode(path)
          })
          setSelectedNodes(new Set())
        } else {
          fsOperations.deleteNode(node.path)
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to delete")
      }
    }
    setContextMenu(null)
  }

  const handleDuplicate = (node: FileNode) => {
    try {
      fsOperations.duplicateNode(node.path)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to duplicate")
    }
    setContextMenu(null)
  }

  const findNodeByPath = (path: string, node: FileNode): FileNode | null => {
    if (node.path === path) return node
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByPath(path, child)
        if (found) return found
      }
    }
    return null
  }

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedPath === node.path || selectedNodes.has(node.path)
    const isRenaming = renamingPath === node.path
    const isDragOver = dragOverNode?.path === node.path
    const paddingLeft = depth * 16

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-neo-bg2 ${
            isSelected ? "bg-neo-bg3 border-l-2 border-neo-fg" : ""
          } ${isDragOver ? "bg-neo-bg3 border-2 border-dashed border-neo-fg" : ""}`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={(e) => handleNodeClick(e, node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          draggable={!isRenaming}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit()
                } else if (e.key === "Escape") {
                  handleRenameCancel()
                }
              }}
              onBlur={handleRenameSubmit}
              className="flex-1 text-sm font-medium text-neo-fg bg-neo-bg border border-neo-fg px-1 rounded"
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

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg">
      <div className="px-3 py-2 border-b-2 border-neo-fg flex items-center justify-between">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Explorer</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNewFile("/")}
            className="p-1 hover:bg-neo-bg2 rounded border border-neo-fg"
            title="New File"
          >
            <Plus className="w-3 h-3 text-neo-fg" />
          </button>
          <button
            onClick={() => handleNewFolder("/")}
            className="p-1 hover:bg-neo-bg2 rounded border border-neo-fg"
            title="New Folder"
          >
            <Folder className="w-3 h-3 text-neo-fg" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto">{renderNode(fileTree)}</div>

      {selectedNodes.size > 1 && (
        <div className="px-3 py-2 border-t-2 border-neo-fg bg-neo-bg2">
          <div className="text-xs text-neo-fg">{selectedNodes.size} items selected</div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed bg-neo-bg border-2 border-neo-fg rounded shadow-neo z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() =>
              handleNewFile(
                contextMenu.node.type === "folder"
                  ? contextMenu.node.path
                  : contextMenu.node.path.substring(0, contextMenu.node.path.lastIndexOf("/")),
              )
            }
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            New File
          </button>
          <button
            onClick={() =>
              handleNewFolder(
                contextMenu.node.type === "folder"
                  ? contextMenu.node.path
                  : contextMenu.node.path.substring(0, contextMenu.node.path.lastIndexOf("/")),
              )
            }
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            New Folder
          </button>
          <hr className="border-neo-fg my-1" />
          <button
            onClick={() => handleRename(contextMenu.node)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            Rename
          </button>
          <button
            onClick={() => handleDuplicate(contextMenu.node)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2"
          >
            Duplicate
          </button>
          <button
            onClick={() => handleDelete(contextMenu.node)}
            className="w-full px-3 py-1 text-left text-sm text-neo-fg hover:bg-neo-bg2 text-red-600"
          >
            Delete {selectedNodes.size > 1 ? `(${selectedNodes.size} items)` : ""}
          </button>
        </div>
      )}
    </div>
  )
}
