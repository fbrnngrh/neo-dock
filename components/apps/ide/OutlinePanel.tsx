"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Hash, ActivityIcon as Function, Type, FileText } from "lucide-react"
import { outlineParser, type OutlineItem } from "@/lib/outline/parser"
import type { FileNode } from "@/data/files"
import { fsOperations } from "@/lib/fs/operations"

interface OutlinePanelProps {
  activeFile: FileNode | null
  onSymbolClick: (line: number, column: number) => void
}

export function OutlinePanel({ activeFile, onSymbolClick }: OutlinePanelProps) {
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!activeFile || !activeFile.language) {
      setOutline([])
      return
    }

    // Get current content (saved or original)
    const savedContent = fsOperations.getFileContent(activeFile.path)
    const content = savedContent || activeFile.content || ""

    const items = outlineParser.parse(content, activeFile.language)
    setOutline(items)

    // Auto-expand all items initially
    const allItemIds = items.map((item, index) => `${item.name}-${index}`)
    setExpandedItems(new Set(allItemIds))
  }, [activeFile])

  const getIconForKind = (kind: OutlineItem["kind"]) => {
    switch (kind) {
      case "function":
      case "method":
        return <Function className="w-4 h-4 text-neo-fg" />
      case "class":
        return <Type className="w-4 h-4 text-neo-fg" />
      case "property":
        return <Hash className="w-4 h-4 text-neo-fg" />
      case "heading":
        return <Hash className="w-4 h-4 text-neo-fg" />
      case "section":
        return <FileText className="w-4 h-4 text-neo-fg" />
      default:
        return <FileText className="w-4 h-4 text-neo-fg" />
    }
  }

  const toggleExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemClick = (item: OutlineItem) => {
    onSymbolClick(item.line, item.column)
  }

  const renderOutlineItem = (item: OutlineItem, index: number, level = 0) => {
    const itemId = `${item.name}-${index}`
    const isExpanded = expandedItems.has(itemId)
    const hasChildren = item.children && item.children.length > 0
    const paddingLeft = level * 16

    return (
      <div key={itemId}>
        <div
          className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-neo-bg2"
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => handleItemClick(item)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpansion(itemId)
              }}
              className="w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-neo-fg" />
              ) : (
                <ChevronRight className="w-3 h-3 text-neo-fg" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {getIconForKind(item.kind)}

          <span className="text-sm font-medium text-neo-fg truncate">{item.name}</span>

          <span className="text-xs text-neo-fg opacity-60 ml-auto">{item.line}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>{item.children!.map((child, childIndex) => renderOutlineItem(child, childIndex, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg">
      <div className="px-3 py-2 border-b-2 border-neo-fg">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Outline</h3>
        {activeFile && (
          <div className="text-xs text-neo-fg opacity-60 mt-1">
            {activeFile.name} • {outline.length} symbols
          </div>
        )}
      </div>

      <div className="overflow-y-auto">
        {outline.length === 0 ? (
          <div className="p-4 text-center text-neo-fg opacity-60">
            {activeFile ? "No symbols found" : "No file selected"}
          </div>
        ) : (
          outline.map((item, index) => renderOutlineItem(item, index))
        )}
      </div>
    </div>
  )
}
