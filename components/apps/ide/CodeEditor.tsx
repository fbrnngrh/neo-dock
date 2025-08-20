"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Play, Square, Save } from "lucide-react"
import type { FileNode } from "@/data/files"
import { runnerRouter } from "@/lib/runner/Router"
import { PlaygroundStorage } from "@/lib/storage/PlaygroundStorage"
import { IframeRunner } from "@/lib/runner/IframeRunner"

interface CodeEditorProps {
  file: FileNode
  onContentChange?: (content: string) => void
  onRunResult?: (result: any) => void
  relatedFiles?: FileNode[]
}

export function CodeEditor({ file, onContentChange, onRunResult, relatedFiles }: CodeEditorProps) {
  const [content, setContent] = useState(file.content || "")
  const [isRunning, setIsRunning] = useState(false)
  const [runnerMode, setRunnerMode] = useState<"worker" | "iframe">("worker")
  const [iframeData, setIframeData] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load saved content from localStorage
    const savedContent = PlaygroundStorage.loadFile(file.path)
    if (savedContent !== null) {
      setContent(savedContent)
      onContentChange?.(savedContent)
    } else {
      setContent(file.content || "")
    }

    // Determine runner mode
    const mode = runnerRouter.getRunnerMode(file)
    setRunnerMode(mode)
  }, [file])

  useEffect(() => {
    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      PlaygroundStorage.saveFile(file.path, content)
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, file.path])

  useEffect(() => {
    const handleRunCommand = () => {
      handleRun()
    }

    window.addEventListener("ide-run-active-file", handleRunCommand)
    return () => window.removeEventListener("ide-run-active-file", handleRunCommand)
  }, [content, file, relatedFiles])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onContentChange?.(newContent)
  }

  const handleRun = async () => {
    if (isRunning) return

    setIsRunning(true)
    try {
      // Create updated file object with current content
      const updatedFile = { ...file, content }
      const updatedRelatedFiles = relatedFiles?.map((f) => {
        const savedContent = PlaygroundStorage.loadFile(f.path)
        return { ...f, content: savedContent || f.content }
      })

      const result = await runnerRouter.runFile(updatedFile, updatedRelatedFiles)

      if (result.mode === "iframe") {
        setIframeData(result)
      }

      onRunResult?.(result)
    } catch (error) {
      onRunResult?.({
        success: false,
        output: [],
        error: error instanceof Error ? error.message : "Unknown error",
        mode: runnerMode,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    runnerRouter.stopExecution()
    setIsRunning(false)
    setIframeData(null)
  }

  const handleSave = () => {
    PlaygroundStorage.saveFile(file.path, content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to run
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleRun()
    }

    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSave()
    }

    // Shift + Esc to stop
    if (e.shiftKey && e.key === "Escape") {
      e.preventDefault()
      handleStop()
    }

    // Tab handling
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + "  " + content.substring(end)

      setContent(newContent)
      onContentChange?.(newContent)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const getLanguageLabel = () => {
    switch (file.language) {
      case "js":
        return "JavaScript"
      case "ts":
        return "TypeScript"
      case "html":
        return "HTML"
      case "css":
        return "CSS"
      default:
        return "Text"
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-neo-bg">
      {/* Toolbar */}
      <div className="h-10 bg-neo-bg2 border-b-2 border-neo-fg flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neo-fg">{getLanguageLabel()}</span>
          <span className="text-xs text-neo-fg opacity-60">({runnerMode} mode)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-1 hover:bg-neo-bg3 rounded border border-neo-fg"
            title="Save (Cmd/Ctrl+S)"
          >
            <Save className="w-4 h-4 text-neo-fg" />
          </button>
          {isRunning ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white border-2 border-neo-fg rounded hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
              title="Stop (Shift+Esc)"
            >
              <Square className="w-3 h-3" />
              <span className="text-xs">Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white border-2 border-neo-fg rounded hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
              title="Run (Cmd/Ctrl+Enter)"
            >
              <Play className="w-3 h-3" />
              <span className="text-xs">Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-4 bg-neo-bg text-neo-fg font-mono text-sm resize-none outline-none border-0"
            placeholder={`Enter your ${getLanguageLabel()} code here...`}
            spellCheck={false}
          />
        </div>

        {/* Preview Panel for HTML mode */}
        {runnerMode === "iframe" && iframeData && (
          <div className="w-1/2 border-l-2 border-neo-fg">
            <div className="h-8 bg-neo-bg2 border-b-2 border-neo-fg flex items-center px-3">
              <span className="text-sm font-medium text-neo-fg">Preview</span>
            </div>
            <div className="flex-1">
              <IframeRunner
                htmlContent={iframeData.htmlContent}
                cssContent={iframeData.cssContent}
                jsContent={iframeData.jsContent}
                onConsoleMessage={(message) => {
                  onRunResult?.({
                    success: true,
                    output: [`[${message.type}] ${message.args.join(" ")}`],
                    mode: "iframe",
                  })
                }}
                liveReload={true}
                debounceMs={500}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
