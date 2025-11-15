"use client"

import { useState, useCallback } from "react"

export type TilingMode = "normal" | "tile-left" | "tile-right" | "maximize"

export interface WindowState {
  id: string
  appId: string
  title: string
  isMinimized: boolean
  isFocused: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
  tilingMode: TilingMode // Added tiling mode to window state
  originalPosition?: { x: number; y: number } // Store original position for restore
  originalSize?: { width: number; height: number } // Store original size for restore
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(100)

  const getTiledDimensions = useCallback((mode: TilingMode) => {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800
    const dockHeight = 100 // Account for dock space
    const availableHeight = screenHeight - dockHeight

    switch (mode) {
      case "tile-left":
        return {
          position: { x: 0, y: 0 },
          size: { width: Math.floor(screenWidth / 2), height: availableHeight },
        }
      case "tile-right":
        return {
          position: { x: Math.floor(screenWidth / 2), y: 0 },
          size: { width: Math.floor(screenWidth / 2), height: availableHeight },
        }
      case "maximize":
        return {
          position: { x: 0, y: 0 },
          size: { width: screenWidth, height: availableHeight },
        }
      default:
        return null
    }
  }, [])

  const openWindow = useCallback(
    (appId: string, title: string, options?: Partial<Pick<WindowState, "position" | "size">>) => {
      const existingWindow = windows.find((w) => w.appId === appId)

      if (existingWindow) {
        // Focus existing window and restore if minimized
        if (existingWindow.isMinimized) {
          restoreWindow(existingWindow.id)
        } else {
          focusWindow(existingWindow.id)
        }
        return existingWindow.id
      }

      // Create new window with improved positioning
      const windowId = `${appId}-${Date.now()}`
      const defaultSize = { width: 800, height: 600 }
      const newWindow: WindowState = {
        id: windowId,
        appId,
        title,
        isMinimized: false,
        isFocused: true,
        zIndex: nextZIndex,
        position: options?.position || {
          x: Math.max(50, 100 + (windows.length % 5) * 40),
          y: Math.max(50, 100 + (windows.length % 5) * 40),
        },
        size: options?.size || defaultSize,
        tilingMode: "normal", // Initialize with normal tiling mode
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

  const tileWindow = useCallback(
    (windowId: string, mode: TilingMode) => {
      const tiledDimensions = getTiledDimensions(mode)
      if (!tiledDimensions) return

      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId) {
            // Store original dimensions if switching from normal mode
            const originalPosition = w.tilingMode === "normal" ? w.position : w.originalPosition
            const originalSize = w.tilingMode === "normal" ? w.size : w.originalSize

            return {
              ...w,
              position: tiledDimensions.position,
              size: tiledDimensions.size,
              tilingMode: mode,
              originalPosition,
              originalSize,
              isFocused: true,
              zIndex: nextZIndex,
            }
          }
          return { ...w, isFocused: false }
        }),
      )
      setNextZIndex((prev) => prev + 1)
    },
    [getTiledDimensions, nextZIndex],
  )

  const restoreFromTiling = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId && w.tilingMode !== "normal") {
            return {
              ...w,
              position: w.originalPosition || { x: 100, y: 100 },
              size: w.originalSize || { width: 800, height: 600 },
              tilingMode: "normal",
              isFocused: true,
              zIndex: nextZIndex,
            }
          }
          return { ...w, isFocused: false }
        }),
      )
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex],
  )

  const updateWindowPosition = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === windowId) {
          // Reset tiling mode when manually moved
          return {
            ...w,
            position,
            tilingMode: "normal",
          }
        }
        return w
      }),
    )
  }, [])

  const updateWindowSize = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === windowId) {
          return {
            ...w,
            size,
          }
        }
        return w
      }),
    )
  }, [])

  const closeAllWindows = useCallback(() => {
    setWindows([])
  }, [])

  const minimizeAllWindows = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true, isFocused: false })))
  }, [])

  const focusNextWindow = useCallback(() => {
    const visibleWindows = windows.filter((w) => !w.isMinimized)
    if (visibleWindows.length === 0) return

    const currentFocused = visibleWindows.find((w) => w.isFocused)
    if (!currentFocused) {
      focusWindow(visibleWindows[0].id)
      return
    }

    const currentIndex = visibleWindows.findIndex((w) => w.id === currentFocused.id)
    const nextIndex = (currentIndex + 1) % visibleWindows.length
    focusWindow(visibleWindows[nextIndex].id)
  }, [windows, focusWindow])

  const getRunningApps = useCallback(() => {
    return Array.from(new Set(windows.map((w) => w.appId)))
  }, [windows])

  const getWindowByAppId = useCallback(
    (appId: string) => {
      return windows.find((w) => w.appId === appId)
    },
    [windows],
  )

  const getMinimizedApps = useCallback(() => {
    return Array.from(new Set(windows.filter((w) => w.isMinimized).map((w) => w.appId)))
  }, [windows])

  const getVisibleWindows = useCallback(() => {
    return windows.filter((w) => !w.isMinimized)
  }, [windows])

  const getFocusedWindow = useCallback(() => {
    return windows.find((w) => w.isFocused && !w.isMinimized)
  }, [windows])

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    tileWindow, // Added tiling function
    restoreFromTiling, // Added restore from tiling function
    updateWindowPosition, // Added position update function
    updateWindowSize, // Added size update function
    closeAllWindows,
    minimizeAllWindows,
    focusNextWindow,
    getRunningApps,
    getMinimizedApps,
    getVisibleWindows,
    getWindowByAppId,
    getFocusedWindow, // Added focused window getter
  }
}
