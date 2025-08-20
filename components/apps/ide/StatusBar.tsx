"use client"

import { Terminal } from "lucide-react"

interface StatusBarProps {
  activeFile?: string
  projectFilterMode: "and" | "or"
  onFilterModeToggle: () => void
  isRunning?: boolean
  onTerminalToggle?: () => void
}

export function StatusBar({
  activeFile,
  projectFilterMode,
  onFilterModeToggle,
  isRunning = false,
  onTerminalToggle,
}: StatusBarProps) {
  const getFileLanguage = (fileName?: string) => {
    if (!fileName) return null
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "js":
        return "JavaScript"
      case "ts":
        return "TypeScript"
      case "html":
        return "HTML"
      case "css":
        return "CSS"
      case "md":
        return "Markdown"
      default:
        return ext?.toUpperCase()
    }
  }

  const language = getFileLanguage(activeFile)

  return (
    <div className="h-8 bg-neo-bg2 border-t-2 border-neo-fg flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        <span className="font-bold text-neo-fg uppercase tracking-wider">WORKSPACE: Portfolio</span>
        {activeFile && (
          <div className="flex items-center gap-2">
            <span className="text-neo-fg opacity-80">{activeFile}</span>
            {language && (
              <span className="px-2 py-0.5 bg-neo-bg3 border border-neo-fg rounded text-neo-fg font-medium">
                {language}
              </span>
            )}
          </div>
        )}
        {isRunning && (
          <div className="flex items-center gap-1 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Running...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {onTerminalToggle && (
          <button
            onClick={onTerminalToggle}
            className="flex items-center gap-1 px-2 py-1 hover:bg-neo-bg3 rounded transition-colors"
            title="Toggle Terminal (Cmd/Ctrl + `)"
          >
            <Terminal className="w-3 h-3 text-neo-fg" />
            <span className="text-neo-fg font-medium">Terminal</span>
          </button>
        )}

        <button
          onClick={onFilterModeToggle}
          className="flex items-center gap-2 px-2 py-1 bg-neo-bg border border-neo-fg rounded hover:bg-neo-bg3 transition-colors"
          title="Toggle project filter mode"
        >
          <span className="text-neo-fg font-medium">Filter Mode:</span>
          <span className="font-bold text-neo-fg uppercase">{projectFilterMode}</span>
        </button>

        <div className="text-neo-fg opacity-80">Ready</div>
      </div>
    </div>
  )
}
