"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Terminal, Minimize2 } from "lucide-react"

interface TerminalMessage {
  type: "output" | "error" | "command" | "system"
  content: string
  timestamp: number
}

interface TerminalPanelProps {
  isVisible: boolean
  onToggle: () => void
  onCommand?: (command: string) => void
}

export function TerminalPanel({ isVisible, onToggle, onCommand }: TerminalPanelProps) {
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      type: "system",
      content: "Neo IDE Terminal v1.0 - Type 'help' for available commands",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  useEffect(() => {
    ;(window as any).terminalClear = () => {
      setMessages([])
    }

    return () => {
      delete (window as any).terminalClear
    }
  }, [])

  const addMessage = (type: TerminalMessage["type"], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: Date.now(),
      },
    ])
  }

  const handleCommand = (command: string) => {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) return

    // Add command to messages
    addMessage("command", `$ ${trimmedCommand}`)

    // Add to history
    setHistory((prev) => [...prev, trimmedCommand])
    setHistoryIndex(-1)

    // Process built-in commands
    const [cmd, ...args] = trimmedCommand.split(" ")

    switch (cmd.toLowerCase()) {
      case "clear":
        setMessages([])
        break
      case "help":
        addMessage("output", "Available commands:")
        addMessage("output", "  clear - Clear terminal")
        addMessage("output", "  help - Show this help")
        addMessage("output", "  run - Run the active file")
        addMessage("output", "  stop - Stop current execution")
        addMessage("output", "  time - Show current time")
        addMessage("output", "  copy <text> - Copy text to clipboard")
        addMessage("output", "  open <appId> - Open application")
        addMessage("output", "  projects --tag <tags> --mode <and|or> - Filter projects")
        addMessage("output", "  skills --group <group> - Filter skills")
        addMessage("output", "  contact --copy-email - Copy email to clipboard")
        break
      case "time":
        addMessage("output", new Date().toLocaleString())
        break
      case "copy":
        const textToCopy = args.join(" ")
        if (textToCopy) {
          navigator.clipboard?.writeText(textToCopy)
          addMessage("output", `Copied: ${textToCopy}`)
        } else {
          addMessage("error", "Usage: copy <text>")
        }
        break
      case "run":
        addMessage("output", "Executing active file...")
        onCommand?.(trimmedCommand)
        break
      case "stop":
        addMessage("output", "Stopping execution...")
        onCommand?.(trimmedCommand)
        break
      default:
        // Pass to parent for handling
        onCommand?.(trimmedCommand)
        break
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setInput("")
        } else {
          setHistoryIndex(newIndex)
          setInput(history[newIndex])
        }
      }
    }
  }

  // Method to add messages from external sources (like code execution)
  const addRunResult = (result: any) => {
    if (result.success) {
      result.output?.forEach((line: string) => {
        addMessage("output", line)
      })
      if (result.duration) {
        addMessage("system", `Execution completed in ${result.duration}ms`)
      }
    } else {
      addMessage("error", result.error || "Execution failed")
    }
  }

  // Expose method to parent
  useEffect(() => {
    ;(window as any).terminalAddResult = addRunResult
  }, [])

  if (!isVisible) return null

  return (
    <div className="h-56 bg-neo-bg border-t-2 border-neo-fg flex flex-col">
      {/* Terminal Header */}
      <div className="h-8 bg-neo-bg2 border-b-2 border-neo-fg flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neo-fg" />
          <span className="text-sm font-medium text-neo-fg">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggle} className="p-1 hover:bg-neo-bg3 rounded" title="Minimize Terminal (Cmd/Ctrl + `)">
            <Minimize2 className="w-3 h-3 text-neo-fg" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-1 ${
              message.type === "error"
                ? "text-red-400"
                : message.type === "command"
                  ? "text-green-400"
                  : message.type === "system"
                    ? "text-blue-400"
                    : "text-neo-fg"
            }`}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-neo-fg p-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-neo-fg font-mono text-sm outline-none"
            placeholder="Enter command..."
          />
        </div>
      </div>
    </div>
  )
}
