"use client"

import { useEffect, useRef } from "react"

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true,
  ignoreWhenFocused: string[] = ["input", "textarea"],
) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if focus is on an input element that should ignore shortcuts
      const activeElement = document.activeElement
      const tagName = activeElement?.tagName.toLowerCase()

      if (tagName && ignoreWhenFocused.includes(tagName)) {
        // Only allow certain shortcuts when focused on inputs
        const allowedWhenFocused = ["Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"]
        if (!allowedWhenFocused.includes(event.key)) {
          return
        }
      }

      for (const shortcut of shortcutsRef.current) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrlKey
        const metaMatches = !!event.metaKey === !!shortcut.metaKey
        const shiftMatches = !!event.shiftKey === !!shortcut.shiftKey
        const altMatches = !!event.altKey === !!shortcut.altKey

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          if (shortcut.stopPropagation) {
            event.stopPropagation()
          }
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [enabled, ignoreWhenFocused])
}
