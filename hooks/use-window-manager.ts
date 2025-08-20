"use client"

import { useState, useCallback, useEffect } from "react"

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
  tilingMode: TilingMode
  originalPosition?: { x: number; y: number }
  originalSize?: { width: number; height: number }
  isMaximized: boolean
  prevBounds?: { x: number; y: number; w: number; h: number }
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(100)

  const getTiledDimensions = useCallback((mode: TilingMode) => {
    if (typeof window === "undefined") {
      return {
        position: { x: 16, y: 16 },
        size: { width: 800, height: 600 },
      }
    }

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Get CSS variables with fallbacks
    const computedStyle = getComputedStyle(document.documentElement)
    const desktopPadding = Number.parseInt(computedStyle.getPropertyValue("--desktop-padding") || "16")
    const dockHeight = Number.parseInt(computedStyle.getPropertyValue("--dock-h") || "64")
    const topbarHeight = Number.parseInt(computedStyle.getPropertyValue("--topbar-h") || "0")

    // Use dvh if available, fallback to vh
    const viewportHeight = window.visualViewport?.height || screenHeight

    // Responsive breakpoint detection
    const isMobile = screenWidth < 640
    const isTablet = screenWidth >= 640 && screenWidth < 1024
    const isDesktop = screenWidth >= 1024

    let padding = desktopPadding
    let dock = dockHeight

    if (isMobile) {
      padding = 0 // Full screen on mobile
      dock = 60
    } else if (isTablet) {
      padding = 12
    }

    const availableWidth = screenWidth - padding * 2
    const availableHeight = viewportHeight - padding * 2 - dock - topbarHeight

    switch (mode) {
      case "tile-left":
        return {
          position: { x: padding, y: padding + topbarHeight },
          size: { width: Math.floor(availableWidth / 2), height: availableHeight },
        }
      case "tile-right":
        return {
          position: { x: padding + Math.floor(availableWidth / 2), y: padding + topbarHeight },
          size: { width: Math.floor(availableWidth / 2), height: availableHeight },
        }
      case "maximize":
        if (isMobile) {
          // Full screen sheet mode on mobile
          return {
            position: { x: 0, y: 0 },
            size: { width: screenWidth, height: viewportHeight },
          }
        }
        return {
          position: { x: padding, y: padding + topbarHeight },
          size: { width: availableWidth, height: availableHeight },
        }
      default:
        return null
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.isMaximized || w.tilingMode !== "normal") {
            const newDimensions = getTiledDimensions(w.tilingMode)
            if (newDimensions) {
              return {
                ...w,
                position: newDimensions.position,
                size: newDimensions.size,
              }
            }
          }
          return w
        }),
      )
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      window.addEventListener("orientationchange", handleResize)

      // Handle visual viewport changes (mobile keyboard, etc.)
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleResize)
      }

      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("orientationchange", handleResize)
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", handleResize)
        }
      }
    }
  }, [getTiledDimensions])

  const openWindow = useCallback(
    (appId: string, title: string, options?: Partial<Pick<WindowState, "position" | "size">>) => {
      const existingWindow = windows.find((w) => w.appId === appId)

      if (existingWindow) {
        if (existingWindow.isMinimized) {
          restoreWindow(existingWindow.id)
        } else {
          focusWindow(existingWindow.id)
        }
        return existingWindow.id
      }

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
        tilingMode: "normal",
        isMaximized: false,
      }

      setWindows((prev) => prev.map((w) => ({ ...w, isFocused: false })).concat(newWindow))
      setNextZIndex((prev) => prev + 1)

      return windowId
    },
    [windows, nextZIndex],
  )

  const maximizeWindow = useCallback(
    (windowId: string) => {
      const tiledDimensions = getTiledDimensions("maximize")
      if (!tiledDimensions) return

      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId && !w.isMaximized) {
            return {
              ...w,
              prevBounds: { x: w.position.x, y: w.position.y, w: w.size.width, h: w.size.height },
              position: tiledDimensions.position,
              size: tiledDimensions.size,
              isMaximized: true,
              tilingMode: "maximize",
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

  const restoreFromMaximize = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId && w.isMaximized && w.prevBounds) {
            return {
              ...w,
              position: { x: w.prevBounds.x, y: w.prevBounds.y },
              size: { width: w.prevBounds.w, height: w.prevBounds.h },
              isMaximized: false,
              tilingMode: "normal",
              prevBounds: undefined,
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

  const toggleMaximize = useCallback(
    (windowId: string) => {
      const window = windows.find((w) => w.id === windowId)
      if (!window) return

      if (window.isMaximized) {
        restoreFromMaximize(windowId)
      } else {
        maximizeWindow(windowId)
      }
    },
    [windows, maximizeWindow, restoreFromMaximize],
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
            const originalPosition = w.tilingMode === "normal" && !w.isMaximized ? w.position : w.originalPosition
            const originalSize = w.tilingMode === "normal" && !w.isMaximized ? w.size : w.originalSize

            return {
              ...w,
              position: tiledDimensions.position,
              size: tiledDimensions.size,
              tilingMode: mode,
              originalPosition,
              originalSize,
              isMaximized: mode === "maximize",
              prevBounds:
                mode === "maximize" && !w.isMaximized
                  ? { x: w.position.x, y: w.position.y, w: w.size.width, h: w.size.height }
                  : w.prevBounds,
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
            const restorePosition =
              w.isMaximized && w.prevBounds
                ? { x: w.prevBounds.x, y: w.prevBounds.y }
                : w.originalPosition || { x: 100, y: 100 }
            const restoreSize =
              w.isMaximized && w.prevBounds
                ? { width: w.prevBounds.w, height: w.prevBounds.h }
                : w.originalSize || { width: 800, height: 600 }

            return {
              ...w,
              position: restorePosition,
              size: restoreSize,
              tilingMode: "normal",
              isMaximized: false,
              prevBounds: undefined,
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
          return {
            ...w,
            position,
            tilingMode: "normal",
            isMaximized: false,
            prevBounds: undefined,
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
    tileWindow,
    restoreFromTiling,
    updateWindowPosition,
    maximizeWindow,
    restoreFromMaximize,
    toggleMaximize,
    closeAllWindows,
    minimizeAllWindows,
    focusNextWindow,
    getRunningApps,
    getMinimizedApps,
    getVisibleWindows,
    getWindowByAppId,
    getFocusedWindow,
  }
}
