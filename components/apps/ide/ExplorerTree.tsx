"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react"
import { type FileNode, fileTree } from "@/data/files"

interface ExplorerTreeProps {
  onFileSelect: (file: FileNode) => void
  selectedPath?: string
}

export function ExplorerTree({ onFileSelect, selectedPath }: ExplorerTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedPath === node.path
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
          <span className="text-sm font-medium text-neo-fg truncate">{node.name}</span>
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
      <div className="px-3 py-2 border-b-2 border-neo-fg">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Explorer</h3>
      </div>
      <div className="overflow-y-auto">{renderNode(fileTree)}</div>
    </div>
  )
}
