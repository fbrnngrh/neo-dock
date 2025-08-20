"use client"

import { useState, useEffect } from "react"
import { EditorTabs, type EditorTab } from "./EditorTabs"
import { EditorPane } from "./EditorPane"
import { findFileByPath } from "@/data/files"
import { fsOperations, type FSState } from "@/lib/fs/operations"

interface PaneManagerProps {
  onRunResult?: (result: any) => void
}

export function PaneManager({ onRunResult }: PaneManagerProps) {
  const [fsState, setFsState] = useState<FSState>(fsOperations.getState())
  const [splitMode, setSplitMode] = useState<"single" | "vertical" | "horizontal">("single")
  const [activePaneId, setActivePaneId] = useState<1 | 2>(1)

  useEffect(() => {
    const unsubscribe = fsOperations.subscribe(setFsState)
    return unsubscribe
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault()
        handleSplitEditor()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault()
        setActivePaneId(1)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault()
        if (splitMode !== "single") {
          setActivePaneId(2)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [splitMode])

  const handleSplitEditor = () => {
    if (splitMode === "single") {
      setSplitMode("vertical")
    } else {
      setSplitMode("single")
      setActivePaneId(1)
    }
  }

  const getTabsForPane = (paneId: 1 | 2): EditorTab[] => {
    return fsState.openTabs
      .filter((tab) => tab.pane === paneId)
      .map((tab) => {
        const file = findFileByPath(tab.path)
        return {
          path: tab.path,
          title: file?.name || "Unknown",
          dirty: fsOperations.getDirtyState(tab.path),
          pinned: tab.pinned,
          isPreview: tab.isPreview,
        }
      })
  }

  const getActiveTabForPane = (paneId: 1 | 2): string | undefined => {
    if (activePaneId === paneId && fsState.activePath) {
      const activeTab = fsState.openTabs.find((tab) => tab.path === fsState.activePath)
      if (activeTab && activeTab.pane === paneId) {
        return fsState.activePath
      }
    }

    // Return the last tab in this pane if no active tab
    const paneTabs = getTabsForPane(paneId)
    return paneTabs.length > 0 ? paneTabs[paneTabs.length - 1].path : undefined
  }

  const handleTabSelect = (path: string, paneId: 1 | 2) => {
    setActivePaneId(paneId)
    fsOperations.updateState({ activePath: path })
  }

  const handleTabClose = (path: string) => {
    fsOperations.closeTab(path)
  }

  const handleTabPin = (path: string) => {
    fsOperations.pinTab(path)
  }

  const handleTabDrag = (path: string, targetPaneId: 1 | 2) => {
    const updatedTabs = fsState.openTabs.map((tab) => (tab.path === path ? { ...tab, pane: targetPaneId } : tab))
    fsOperations.updateState({ openTabs: updatedTabs })
  }

  const pane1Tabs = getTabsForPane(1)
  const pane2Tabs = getTabsForPane(2)
  const pane1ActiveTab = getActiveTabForPane(1)
  const pane2ActiveTab = getActiveTabForPane(2)

  const pane1File = pane1ActiveTab ? findFileByPath(pane1ActiveTab) : null
  const pane2File = pane2ActiveTab ? findFileByPath(pane2ActiveTab) : null

  if (splitMode === "single") {
    return (
      <div className="flex-1 flex flex-col">
        <EditorTabs
          tabs={pane1Tabs}
          activeTab={pane1ActiveTab}
          onTabSelect={(path) => handleTabSelect(path, 1)}
          onTabClose={handleTabClose}
          onTabPin={handleTabPin}
        />
        <div className="flex-1 flex">
          <EditorPane file={pane1File} onRunResult={onRunResult} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className={`flex-1 flex ${splitMode === "vertical" ? "flex-row" : "flex-col"}`}>
        {/* Pane 1 */}
        <div
          className={`flex flex-col ${splitMode === "vertical" ? "flex-1 border-r-2" : "flex-1 border-b-2"} border-neo-fg ${
            activePaneId === 1 ? "bg-neo-bg" : "bg-neo-bg2"
          }`}
          onClick={() => setActivePaneId(1)}
        >
          <EditorTabs
            tabs={pane1Tabs}
            activeTab={pane1ActiveTab}
            onTabSelect={(path) => handleTabSelect(path, 1)}
            onTabClose={handleTabClose}
            onTabPin={handleTabPin}
          />
          <div className="flex-1 flex">
            <EditorPane file={pane1File} onRunResult={onRunResult} />
          </div>
        </div>

        {/* Pane 2 */}
        <div
          className={`flex flex-col ${splitMode === "vertical" ? "flex-1" : "flex-1"} ${
            activePaneId === 2 ? "bg-neo-bg" : "bg-neo-bg2"
          }`}
          onClick={() => setActivePaneId(2)}
        >
          <EditorTabs
            tabs={pane2Tabs}
            activeTab={pane2ActiveTab}
            onTabSelect={(path) => handleTabSelect(path, 2)}
            onTabClose={handleTabClose}
            onTabPin={handleTabPin}
          />
          <div className="flex-1 flex">
            <EditorPane file={pane2File} onRunResult={onRunResult} />
          </div>
        </div>
      </div>
    </div>
  )
}
