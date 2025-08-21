"use client"

import { X, Pin } from "lucide-react"

export interface EditorTab {
  path: string
  title: string
  dirty: boolean
  pinned: boolean // Added pinned state
  isPreview: boolean // Added preview state
}

interface EditorTabsProps {
  tabs: EditorTab[]
  activeTab?: string
  onTabSelect: (path: string) => void
  onTabClose: (path: string) => void
  onTabPin?: (path: string) => void // Added pin handler
}

export function EditorTabs({ tabs, activeTab, onTabSelect, onTabClose, onTabPin }: EditorTabsProps) {
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
          onDoubleClick={() => onTabPin?.(tab.path)} // Double-click to pin
        >
          {tab.pinned && <Pin className="w-3 h-3 text-neo-fg" />}

          <span
            className={`text-sm font-medium text-neo-fg whitespace-nowrap ${
              tab.isPreview ? "italic opacity-75" : "" // Preview tabs are italic
            }`}
          >
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
