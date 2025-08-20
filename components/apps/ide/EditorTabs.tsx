"use client"

import { X } from "lucide-react"

export interface EditorTab {
  path: string
  title: string
  dirty: boolean
}

interface EditorTabsProps {
  tabs: EditorTab[]
  activeTab?: string
  onTabSelect: (path: string) => void
  onTabClose: (path: string) => void
}

export function EditorTabs({ tabs, activeTab, onTabSelect, onTabClose }: EditorTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="h-10 bg-neo-bg2 border-b-2 border-neo-fg flex items-center px-3">
        <span className="text-sm text-neo-fg opacity-60">No files open</span>
      </div>
    )
  }

  return (
    <div className="h-10 bg-neo-bg2 border-b-2 border-neo-fg flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`flex items-center gap-2 px-3 py-2 border-r-2 border-neo-fg cursor-pointer hover:bg-neo-bg3 ${
            activeTab === tab.path ? "bg-neo-bg" : ""
          }`}
          onClick={() => onTabSelect(tab.path)}
        >
          <span className="text-sm font-medium text-neo-fg whitespace-nowrap">
            {tab.title}
            {tab.dirty && "*"}
          </span>
          <button
            className="w-4 h-4 flex items-center justify-center hover:bg-neo-fg hover:text-neo-bg rounded-sm"
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.path)
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
