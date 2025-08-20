"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { parseCommand, getCommandSuggestions, type CommandResult } from "@/lib/commands/CommandParser"

interface TerminalEntry {
  type: "input" | "output"
  content: string
  timestamp: Date
  resultType?: "success" | "error" | "info"
}

interface TerminalScreenProps {
  onCommand?: (result: CommandResult) => void
}

export function TerminalScreen({ onCommand }: TerminalScreenProps) {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      type: "output",
      content: "Welcome to Neo-OS Terminal v1.0\nType 'help' to see available commands.\n",
      timestamp: new Date(),
      resultType: "info",
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-focus input when component mounts
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  useEffect(() => {
    // Update suggestions when input changes
    if (currentInput.trim()) {
      const newSuggestions = getCommandSuggestions(currentInput)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [currentInput])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentInput.trim()) return

    // Add input to entries
    const inputEntry: TerminalEntry = {
      type: "input",
      content: currentInput,
      timestamp: new Date(),
    }

    // Parse command and get result
    const result = parseCommand(currentInput)

    const outputEntry: TerminalEntry = {
      type: "output",
      content: result.message,
      timestamp: new Date(),
      resultType: result.type,
    }

    setEntries((prev) => [...prev, inputEntry, outputEntry])

    // Add to command history
    setCommandHistory((prev) => [...prev, currentInput])
    setHistoryIndex(-1)

    // Execute command action if provided
    if (result.action && onCommand) {
      onCommand(result)
    }

    // Clear input
    setCurrentInput("")
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      if (suggestions.length > 0) {
        setCurrentInput(suggestions[0])
        setShowSuggestions(false)
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getResultTypeColor = (type?: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-neo-fg"
    }
  }

  return (
    <div
      className="h-full bg-neo-bg font-mono text-sm flex flex-col"
      role="application"
      aria-label="Terminal interface"
    >
      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        aria-atomic="false"
      >
        {entries.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <span
              className="text-neo-fg opacity-60 text-xs shrink-0 w-20"
              aria-label={`Time: ${formatTimestamp(entry.timestamp)}`}
            >
              {formatTimestamp(entry.timestamp)}
            </span>
            <div className="flex-1">
              {entry.type === "input" ? (
                <div className="flex gap-2" role="group" aria-label="Command input">
                  <span className="text-neo-fg font-bold" aria-hidden="true">
                    $
                  </span>
                  <span className="text-neo-fg">{entry.content}</span>
                </div>
              ) : (
                <pre
                  className={`whitespace-pre-wrap ${getResultTypeColor(entry.resultType)}`}
                  role="status"
                  aria-label={`Command result: ${entry.resultType || "output"}`}
                >
                  {entry.content}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="border-t-2 border-neo-fg bg-neo-bg2 p-2" role="region" aria-label="Command suggestions">
          <div className="text-xs text-neo-fg opacity-60 mb-1">Suggestions (Tab to complete):</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Available command suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-2 py-1 bg-neo-bg3 border border-neo-fg rounded text-xs hover:bg-neo-fg hover:text-neo-bg transition-colors neo-focus"
                onClick={() => {
                  setCurrentInput(suggestion)
                  setShowSuggestions(false)
                  inputRef.current?.focus()
                }}
                aria-label={`Use suggestion: ${suggestion}`}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t-2 border-neo-fg bg-neo-bg2 p-4"
        role="search"
        aria-label="Command input form"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="terminal-input" className="text-neo-fg font-bold" aria-label="Command prompt">
            $
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-neo-fg outline-none font-mono neo-focus"
            placeholder="Enter command..."
            autoComplete="off"
            aria-label="Terminal command input"
            aria-describedby="terminal-help"
          />
          <div id="terminal-help" className="sr-only">
            Use arrow keys to navigate command history, Tab to autocomplete, and Enter to execute commands.
          </div>
        </div>
      </form>
    </div>
  )
}
