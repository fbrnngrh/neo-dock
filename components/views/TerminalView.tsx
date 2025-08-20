"use client"

import { TerminalScreen } from "@/components/apps/terminal/TerminalScreen"
import type { CommandResult } from "@/lib/commands/CommandParser"

export function TerminalView() {
  const handleCommand = (result: CommandResult) => {
    if (!result.action) return

    switch (result.action.type) {
      case "open-app":
        // Dispatch event to open app
        window.dispatchEvent(
          new CustomEvent("terminal-open-app", {
            detail: { appId: result.action.payload.appId, filter: result.action.payload.filter },
          }),
        )
        break

      case "filter-projects":
        // Dispatch event to filter projects
        window.dispatchEvent(
          new CustomEvent("terminal-filter-projects", {
            detail: { tags: result.action.payload.tags, mode: result.action.payload.mode },
          }),
        )
        break

      case "copy-text":
        // Copy text to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(result.action.payload.text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement("textarea")
            textArea.value = result.action.payload.text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
          })
        }
        break

      case "toggle-theme":
        // Dispatch theme toggle event
        window.dispatchEvent(new CustomEvent("terminal-toggle-theme"))
        break

      case "close-windows":
        // Dispatch close all windows event
        window.dispatchEvent(new CustomEvent("terminal-close-all-windows"))
        break

      case "focus-window":
        // Dispatch focus next window event
        window.dispatchEvent(new CustomEvent("terminal-focus-next-window"))
        break
    }
  }

  return <TerminalScreen onCommand={handleCommand} />
}
