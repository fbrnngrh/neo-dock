"use client"

import { useState } from "react"
import { ExplorerTree } from "@/components/apps/ide/ExplorerTree"
import { EditorTabs, type EditorTab } from "@/components/apps/ide/EditorTabs"
import { EditorPane } from "@/components/apps/ide/EditorPane"
import { InspectorPane } from "@/components/apps/ide/InspectorPane"
import { StatusBar } from "@/components/apps/ide/StatusBar"
import { type FileNode, findFileByPath } from "@/data/files"

export function IDEView() {
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [projectFilterMode, setProjectFilterMode] = useState<"and" | "or">("and")

  const activeFile = activeTab ? findFileByPath(activeTab) : null

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      // Check if tab already exists
      const existingTab = tabs.find((tab) => tab.path === file.path)

      if (!existingTab) {
        // Create new tab
        const newTab: EditorTab = {
          path: file.path,
          title: file.name,
          dirty: false,
        }
        setTabs((prev) => [...prev, newTab])
      }

      setActiveTab(file.path)
    }
  }

  const handleTabClose = (path: string) => {
    setTabs((prev) => prev.filter((tab) => tab.path !== path))

    if (activeTab === path) {
      const remainingTabs = tabs.filter((tab) => tab.path !== path)
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].path : undefined)
    }
  }

  const handleFilterModeToggle = () => {
    setProjectFilterMode((prev) => (prev === "and" ? "or" : "and"))
    // Dispatch custom event to update Projects filter globally
    window.dispatchEvent(
      new CustomEvent("projects-filter-mode-change", {
        detail: { mode: projectFilterMode === "and" ? "or" : "and" },
      }),
    )
  }

  return (
    <div className="h-full flex flex-col bg-neo-bg">
      <div className="flex-1 flex">
        <div className="w-64">
          <ExplorerTree onFileSelect={handleFileSelect} selectedPath={activeTab} />
        </div>

        <div className="flex-1 flex flex-col">
          <EditorTabs tabs={tabs} activeTab={activeTab} onTabSelect={setActiveTab} onTabClose={handleTabClose} />

          <div className="flex-1 flex">
            <EditorPane file={activeFile} />
            <InspectorPane file={activeFile} />
          </div>
        </div>
      </div>

      <StatusBar
        activeFile={activeFile?.name}
        projectFilterMode={projectFilterMode}
        onFilterModeToggle={handleFilterModeToggle}
      />
    </div>
  )
}
