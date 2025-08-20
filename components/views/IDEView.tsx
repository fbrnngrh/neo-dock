"use client"

import { useState, useEffect } from "react"
import { ExplorerTree } from "@/components/apps/ide/ExplorerTree"
import { EditorTabs, type EditorTab } from "@/components/apps/ide/EditorTabs"
import { EditorPane } from "@/components/apps/ide/EditorPane"
import { InspectorPane } from "@/components/apps/ide/InspectorPane"
import { StatusBar } from "@/components/apps/ide/StatusBar"
import { TerminalPanel } from "@/components/apps/ide/TerminalPanel"
import { KeyboardShortcutsHelp } from "@/components/apps/ide/KeyboardShortcutsHelp"
import { type FileNode, findFileByPath } from "@/data/files"
import { runnerRouter } from "@/lib/runner/Router"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"

export function IDEView() {
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [projectFilterMode, setProjectFilterMode] = useState<"and" | "or">("and")
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  const activeFile = activeTab ? findFileByPath(activeTab) : null

  const shortcuts = [
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
    const handleCommandPaletteAction = (event: CustomEvent) => {
      const { action, templateId, filePath } = event.detail

      switch (action) {
        case "run-active-file":
          if (
            activeFile &&
            (activeFile.language === "js" || activeFile.language === "ts" || activeFile.language === "html")
          ) {
            setIsRunning(true)
            window.dispatchEvent(new CustomEvent("ide-run-active-file"))
          }
          break
        case "stop-runner":
          runnerRouter.stopExecution()
          setIsRunning(false)
          break
        case "toggle-terminal":
          setIsTerminalVisible(!isTerminalVisible)
          break
        case "split-editor":
          // TODO: Implement split editor functionality
          console.log("Split editor not yet implemented")
          break
        case "open-playground-template":
          // TODO: Implement template opening
          console.log(`Opening template: ${templateId}`)
          break
        case "open-file":
          if (filePath) {
            const file = findFileByPath(filePath)
            if (file) {
              handleFileSelect(file)
            }
          }
          break
      }
    }

    window.addEventListener("command-palette-action", handleCommandPaletteAction as EventListener)
    return () => window.removeEventListener("command-palette-action", handleCommandPaletteAction as EventListener)
  }, [activeFile, isTerminalVisible])

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

  const handleRunResult = (result: any) => {
    setIsRunning(false)
    // Forward result to terminal
    if ((window as any).terminalAddResult) {
      ;(window as any).terminalAddResult(result)
    }
  }

  const handleTerminalCommand = (command: string) => {
    const [cmd, ...args] = command.trim().split(" ")

    switch (cmd.toLowerCase()) {
      case "run":
        if (
          activeFile &&
          (activeFile.language === "js" || activeFile.language === "ts" || activeFile.language === "html")
        ) {
          setIsRunning(true)
          // Trigger run on active file - this will be handled by the CodeEditor
          window.dispatchEvent(new CustomEvent("ide-run-active-file"))
        } else {
          if ((window as any).terminalAddResult) {
            ;(window as any).terminalAddResult({
              success: false,
              output: [],
              error: "No executable file is currently active",
            })
          }
        }
        break
      case "stop":
        runnerRouter.stopExecution()
        setIsRunning(false)
        if ((window as any).terminalAddResult) {
          ;(window as any).terminalAddResult({
            success: true,
            output: ["Execution stopped"],
            duration: 0,
          })
        }
        break
      case "open":
        const appId = args[0]
        if (appId) {
          window.dispatchEvent(
            new CustomEvent("terminal-open-app", {
              detail: { appId },
            }),
          )
        }
        break
      case "projects":
        // Handle projects command with filters
        const tagIndex = args.indexOf("--tag")
        const modeIndex = args.indexOf("--mode")

        if (tagIndex !== -1 && tagIndex + 1 < args.length) {
          const tags = args[tagIndex + 1].split(",")
          const mode = modeIndex !== -1 && modeIndex + 1 < args.length ? args[modeIndex + 1] : "and"

          window.dispatchEvent(
            new CustomEvent("terminal-filter-projects", {
              detail: { tags, mode },
            }),
          )

          if ((window as any).terminalAddResult) {
            ;(window as any).terminalAddResult({
              success: true,
              output: [`Filtered projects by tags: ${tags.join(", ")} (${mode} mode)`],
              duration: 0,
            })
          }
        } else {
          if ((window as any).terminalAddResult) {
            ;(window as any).terminalAddResult({
              success: false,
              output: [],
              error: "Usage: projects --tag <tag1,tag2> --mode <and|or>",
            })
          }
        }
        break
      case "skills":
        const groupIndex = args.indexOf("--group")
        if (groupIndex !== -1 && groupIndex + 1 < args.length) {
          const group = args[groupIndex + 1]
          // Open skills with specific group filter
          window.dispatchEvent(
            new CustomEvent("terminal-open-app", {
              detail: { appId: "skills", filter: { group } },
            }),
          )

          if ((window as any).terminalAddResult) {
            ;(window as any).terminalAddResult({
              success: true,
              output: [`Opened skills filtered by group: ${group}`],
              duration: 0,
            })
          }
        } else {
          window.dispatchEvent(
            new CustomEvent("terminal-open-app", {
              detail: { appId: "skills" },
            }),
          )
        }
        break
      case "contact":
        if (args.includes("--copy-email")) {
          // Copy email to clipboard
          const email = "neo@example.com" // This should come from profile data
          navigator.clipboard?.writeText(email)
          if ((window as any).terminalAddResult) {
            ;(window as any).terminalAddResult({
              success: true,
              output: [`Email copied to clipboard: ${email}`],
              duration: 0,
            })
          }
        } else {
          window.dispatchEvent(
            new CustomEvent("terminal-open-app", {
              detail: { appId: "contact" },
            }),
          )
        }
        break
      default:
        if ((window as any).terminalAddResult) {
          ;(window as any).terminalAddResult({
            success: false,
            output: [],
            error: `Unknown command: ${cmd}. Type 'help' for available commands.`,
          })
        }
        break
    }
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
