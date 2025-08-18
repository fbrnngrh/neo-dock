"use client"

import { useState, useCallback } from "react"

export interface WindowState {
  id: string
  appId: string
  title: string
  isMinimized: boolean
  isFocused: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(100)

  const openWindow = useCallback(
    (appId: string, title: string, options?: Partial<Pick<WindowState, "position" | "size">>) => {
      const existingWindow = windows.find((w) => w.appId === appId)

      if (existingWindow) {
        // Focus existing window
        focusWindow(existingWindow.id)
        if (existingWindow.isMinimized) {
          restoreWindow(existingWindow.id)
        }
        return existingWindow.id
      }

      // Create new window
      const windowId = `${appId}-${Date.now()}`
      const newWindow: WindowState = {
        id: windowId,
        appId,
        title,
        isMinimized: false,
        isFocused: true,
        zIndex: nextZIndex,
        position: options?.position || { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
        size: options?.size || { width: 600, height: 400 },
      }

      setWindows((prev) => prev.map((w) => ({ ...w, isFocused: false })).concat(newWindow))
      setNextZIndex((prev) => prev + 1)

      return windowId
    },
    [windows, nextZIndex],
  )

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
  }, [])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true, isFocused: false } : w)))
  }, [])

  const restoreWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId) {
            return { ...w, isMinimized: false, isFocused: true, zIndex: nextZIndex }
          }
          return { ...w, isFocused: false }
        }),
      )
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex],
  )

  const focusWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId) {
            return { ...w, isFocused: true, zIndex: nextZIndex }
          }
          return { ...w, isFocused: false }
        }),
      )
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex],
  )

  const getRunningApps = useCallback(() => {
    return Array.from(new Set(windows.map((w) => w.appId)))
  }, [windows])

  const getWindowByAppId = useCallback(
    (appId: string) => {
      return windows.find((w) => w.appId === appId)
    },
    [windows],
  )

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    getRunningApps,
    getWindowByAppId,
  }
}
