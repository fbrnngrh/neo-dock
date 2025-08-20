"use client"

import { useState, useEffect } from "react"
import { ExplorerTree } from "@/components/apps/ide/ExplorerTree"
import { PaneManager } from "@/components/apps/ide/PaneManager"
import { InspectorPane } from "@/components/apps/ide/InspectorPane"
import { StatusBar } from "@/components/apps/ide/StatusBar"
import { TerminalPanel } from "@/components/apps/ide/TerminalPanel"
import { KeyboardShortcutsHelp } from "@/components/apps/ide/KeyboardShortcutsHelp"
import { QuickOpen } from "@/components/apps/ide/QuickOpen"
import { type FileNode, findFileByPath, fileTree } from "@/data/files"
import { runnerRouter } from "@/lib/runner/Router"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"
import { fsOperations, type FSState } from "@/lib/fs/operations"

export function IDEView() {
  const [fsState, setFsState] = useState<FSState>(fsOperations.getState())
  const [projectFilterMode, setProjectFilterMode] = useState<"and" | "or">("and")
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showQuickOpen, setShowQuickOpen] = useState(false)

  const activeFile = fsState.activePath ? findFileByPath(fsState.activePath) : null

  useEffect(() => {
    const unsubscribe = fsOperations.subscribe(setFsState)
    return unsubscribe
  }, [])

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
        setShowQuickOpen(true)
      },
      description: "Quick Open",
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
          // This is now handled by PaneManager
          console.log("Split editor handled by PaneManager")
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

  const handleFileSelect = (file: FileNode, asPreview = true) => {
    if (file.type === "file") {
      fsOperations.openFile(file.path, asPreview)
    }
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

  const handleFilterModeToggle = () => {
    setProjectFilterMode((prevMode) => (prevMode === "and" ? "or" : "and"))
  }

  return (
    <div className="h-full flex flex-col bg-neo-bg">
      <div className="flex-1 flex">
        <div className="w-64">
          <ExplorerTree
            onFileSelect={handleFileSelect}
            selectedPath={fsState.activePath || undefined}
            fileTree={fileTree}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <PaneManager onRunResult={handleRunResult} />
          <InspectorPane file={activeFile} />
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

      <QuickOpen isOpen={showQuickOpen} onClose={() => setShowQuickOpen(false)} onFileSelect={handleFileSelect} />
    </div>
  )
}
