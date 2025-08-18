"use client"

import { useEffect, useCallback } from "react"

export interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const metaMatches = !!shortcut.metaKey === !!event.metaKey
        const ctrlMatches = !!shortcut.ctrlKey === !!event.ctrlKey
        const altMatches = !!shortcut.altKey === !!event.altKey
        const shiftMatches = !!shortcut.shiftKey === !!event.shiftKey

        if (keyMatches && metaMatches && ctrlMatches && altMatches && shiftMatches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}
