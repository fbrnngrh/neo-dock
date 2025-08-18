"use client"

import { useEffect, useRef, useState } from "react"

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null)
  const focusHistoryRef = useRef<string[]>([])

  const setFocus = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.focus()
      setFocusedElement(elementId)

      // Add to focus history
      focusHistoryRef.current = focusHistoryRef.current.filter((id) => id !== elementId)
      focusHistoryRef.current.push(elementId)

      // Keep only last 10 items in history
      if (focusHistoryRef.current.length > 10) {
        focusHistoryRef.current = focusHistoryRef.current.slice(-10)
      }
    }
  }

  const focusPrevious = () => {
    if (focusHistoryRef.current.length > 1) {
      // Remove current focus from history and focus the previous one
      focusHistoryRef.current.pop()
      const previousId = focusHistoryRef.current[focusHistoryRef.current.length - 1]
      if (previousId) {
        setFocus(previousId)
      }
    }
  }

  const trapFocus = (containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    containerElement.addEventListener("keydown", handleTabKey)
    return () => containerElement.removeEventListener("keydown", handleTabKey)
  }

  useEffect(() => {
    const handleFocusChange = () => {
      const activeElement = document.activeElement
      if (activeElement && activeElement.id) {
        setFocusedElement(activeElement.id)
      }
    }

    document.addEventListener("focusin", handleFocusChange)
    return () => document.removeEventListener("focusin", handleFocusChange)
  }, [])

  return {
    focusedElement,
    setFocus,
    focusPrevious,
    trapFocus,
  }
}
