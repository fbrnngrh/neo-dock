"use client"

import { useState, useEffect } from "react"
import { ExplorerTree } from "@/components/apps/ide/ExplorerTree"
import { EditorTabs, type EditorTab } from "@/components/apps/ide/EditorTabs"
import { EditorPane } from "@/components/apps/ide/EditorPane"
import { InspectorPane } from "@/components/apps/ide/InspectorPane"
import { StatusBar } from "@/components/apps/ide/StatusBar"
import { TerminalPanel } from "@/components/apps/ide/TerminalPanel"
import { KeyboardShortcutsHelp } from "@/components/apps/ide/KeyboardShortcutsHelp"
import { type FileNode, fileTree } from "@/data/files"
import { runnerRouter } from "@/lib/runner/Router"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"
import { FSOperations } from "@/lib/fs/operations"
import { HistoryStore } from "@/lib/history/store"
import { handleRunResult } from "@/lib/runner/handleRunResult"
import { handleTerminalCommand } from "@/lib/terminal/handleTerminalCommand"
import { handleFilterModeToggle } from "@/lib/statusBar/handleFilterModeToggle"

const findFileInTree = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findFileInTree(node.children, path)
      if (found) return found
    }
  }
  return null
}

export function IDEView() {
  const [tree, setTree] = useState<FileNode[]>([fileTree])
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [selection, setSelection] = useState<string[]>([])
  const [projectFilterMode, setProjectFilterMode] = useState<"and" | "or">("and")
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  const activeFile = activeTab ? findFileInTree(tree, activeTab) : null

  const shortcuts = [
    {
      key: "n",
      ctrlKey: true,
      action: () => {
        const parentPath = selection.length > 0 ? selection[0] : "/"
        const parent = findFileInTree(tree, parentPath)
        const targetPath = parent?.type === "folder" ? parentPath : "/"

        const result = FSOperations.createFile(tree, targetPath, "untitled.js", "", "js")
        if (result.success && result.newTree) {
          setTree(result.newTree)
          FSOperations.saveToStorage(result.newTree)
        }
      },
      description: "New file",
    },
    {
      key: "n",
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        const parentPath = selection.length > 0 ? selection[0] : "/"
        const parent = findFileInTree(tree, parentPath)
        const targetPath = parent?.type === "folder" ? parentPath : "/"

        const result = FSOperations.createFolder(tree, targetPath, "New Folder")
        if (result.success && result.newTree) {
          setTree(result.newTree)
          FSOperations.saveToStorage(result.newTree)
        }
      },
      description: "New folder",
    },
    {
      key: "F2",
      action: () => {
        if (selection.length === 1) {
          // Trigger rename mode - this will be handled by ExplorerTree
          window.dispatchEvent(new CustomEvent("ide-rename-file", { detail: { path: selection[0] } }))
        }
      },
      description: "Rename",
    },
    {
      key: "Delete",
      action: () => {
        if (selection.length > 0) {
          const message = selection.length > 1 ? `Delete ${selection.length} selected items?` : `Delete selected item?`

          if (confirm(message)) {
            let newTree = [...tree]
            for (const path of selection) {
              const result = FSOperations.deleteNode(newTree, path)
              if (result.success && result.newTree) {
                newTree = result.newTree
              }
            }
            setTree(newTree)
            FSOperations.saveToStorage(newTree)
            setSelection([])
          }
        }
      },
      description: "Delete",
    },
    {
      key: "d",
      ctrlKey: true,
      action: () => {
        if (selection.length === 1) {
          const result = FSOperations.duplicateNode(tree, selection[0])
          if (result.success && result.newTree) {
            setTree(result.newTree)
            FSOperations.saveToStorage(result.newTree)
          }
        }
      },
      description: "Duplicate",
    },
    {
      key: "Enter",
      ctrlKey: true,
      action: () => {
        if (
          activeFile &&
          (activeFile.language === "js" || activeFile.language === "ts" || activeFile.language === "html")
        ) {
          setIsRunning(true)
          window.dispatchEvent(new CustomEvent("ide-run-active-file"))
        }
      },
      description: "Run active file",
    },
    {
      key: "Escape",
      shiftKey: true,
      action: () => {
        runnerRouter.stopExecution()
        setIsRunning(false)
      },
      description: "Stop execution",
    },
    {
      key: "`",
      ctrlKey: true,
      action: () => setIsTerminalVisible(!isTerminalVisible),
      description: "Toggle terminal",
    },
    {
      key: "c",
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Clear terminal
        if ((window as any).terminalAddResult) {
          ;(window as any).terminalClear?.()
        }
      },
      description: "Clear terminal",
    },
    {
      key: "p",
      ctrlKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-command-palette"))
      },
      description: "Open command palette",
    },
    {
      key: "F1",
      action: () => setShowKeyboardHelp(true),
      description: "Show keyboard shortcuts",
    },
  ]

  // Add metaKey variants for Mac
  const macShortcuts = shortcuts.map((shortcut) => ({
    ...shortcut,
    metaKey: shortcut.ctrlKey,
    ctrlKey: false,
  }))

  useKeyboardShortcuts([...shortcuts, ...macShortcuts], true, ["input", "textarea"])

  useEffect(() => {
    const savedTree = FSOperations.loadFromStorage()
    if (savedTree) {
      setTree(savedTree)
    }
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleContentChange = (event: CustomEvent) => {
      const { path, content } = event.detail

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Debounced autosave
      timeoutId = setTimeout(() => {
        HistoryStore.saveVersion(path, content)

        // Mark tab as clean after save
        setTabs((prev) => prev.map((tab) => (tab.path === path ? { ...tab, dirty: false } : tab)))
      }, 1000)
    }

    window.addEventListener("ide-content-change", handleContentChange as EventListener)
    return () => {
      window.removeEventListener("ide-content-change", handleContentChange as EventListener)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      const existingTab = tabs.find((tab) => tab.path === file.path)
      const existingPreviewTab = tabs.find((tab) => tab.isPreview && !tab.pinned)

      if (!existingTab) {
        // Replace existing preview tab or create new one
        if (existingPreviewTab) {
          setTabs((prev) =>
            prev.map((tab) =>
              tab.isPreview && !tab.pinned
                ? { path: file.path, title: file.name, dirty: false, pinned: false, isPreview: true }
                : tab,
            ),
          )
        } else {
          const newTab: EditorTab = {
            path: file.path,
            title: file.name,
            dirty: false,
            pinned: false,
            isPreview: true,
          }
          setTabs((prev) => [...prev, newTab])
        }
      }

      setActiveTab(file.path)
    }
  }

  const handleTabPin = (path: string) => {
    setTabs((prev) => prev.map((tab) => (tab.path === path ? { ...tab, pinned: true, isPreview: false } : tab)))
  }

  const handleTabClose = (path: string) => {
    setTabs((prev) => prev.filter((tab) => tab.path !== path))

    if (activeTab === path) {
      const remainingTabs = tabs.filter((tab) => tab.path !== path)
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].path : undefined)
    }
  }

  return (
    <div className="h-full flex flex-col bg-neo-bg">
      <div className="flex-1 flex">
        <div className="w-64">
          <ExplorerTree
            tree={tree}
            onTreeChange={(newTree) => {
              setTree(newTree)
              FSOperations.saveToStorage(newTree)
            }}
            onFileSelect={handleFileSelect}
            selectedPath={activeTab}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <EditorTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabSelect={setActiveTab}
            onTabClose={handleTabClose}
            onTabPin={handleTabPin}
          />

          <div className="flex-1 flex">
            <EditorPane file={activeFile} onRunResult={handleRunResult} />
            <InspectorPane file={activeFile} />
          </div>
        </div>
      </div>

      <TerminalPanel
        isVisible={isTerminalVisible}
        onToggle={() => setIsTerminalVisible(!isTerminalVisible)}
        onCommand={handleTerminalCommand}
      />

      <StatusBar
        activeFile={activeFile?.name}
        projectFilterMode={projectFilterMode}
        onFilterModeToggle={handleFilterModeToggle}
        isRunning={isRunning}
        onTerminalToggle={() => setIsTerminalVisible(!isTerminalVisible)}
      />

      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  )
}
