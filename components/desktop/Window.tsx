"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type { TilingMode } from "@/hooks/use-window-manager"
import { useMobile } from "@/hooks/use-mobile"

interface WindowProps {
  appId: string
  title: string
  children: React.ReactNode
  initialSize?: { width: number; height: number }
  initialPosition?: { x: number; y: number }
  isMinimized?: boolean
  isFocused?: boolean
  zIndex?: number
  tilingMode?: TilingMode
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  onTile?: (mode: TilingMode) => void
  onRestoreFromTiling?: () => void
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null

export function Window({
  appId,
  title,
  children,
  initialSize = { width: 800, height: 600 },
  initialPosition = { x: 100, y: 100 },
  isMinimized = false,
  isFocused = false,
  zIndex = 1,
  tilingMode = "normal",
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  onSizeChange,
  onTile,
  onRestoreFromTiling,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showSnapPreview, setShowSnapPreview] = useState<TilingMode | null>(null)
  const [macControlsHovered, setMacControlsHovered] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isMobile = useMobile()

  const minSize = { width: 400, height: 300 }
  const HEADER_HEIGHT = 38 // Native window header height
  const MENU_BAR_HEIGHT = 28 // Menu bar height

  useEffect(() => {
    if (!isMobile) {
      setPosition(initialPosition)
      setSize(initialSize)
    }
  }, [initialPosition, initialSize, isMobile])

  // Handle window dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && animationFrameRef.current === undefined && tilingMode === "normal" && !isMobile) {
        animationFrameRef.current = requestAnimationFrame(() => {
          const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x))
          const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
          const newPosition = { x: newX, y: newY }
          setPosition(newPosition)
          onPositionChange?.(newPosition)

          // Show snap preview when near edges
          const snapThreshold = 20
          if (e.clientY < snapThreshold) {
            setShowSnapPreview("maximize")
          } else if (e.clientX < snapThreshold) {
            setShowSnapPreview("tile-left")
          } else if (e.clientX > window.innerWidth - snapThreshold) {
            setShowSnapPreview("tile-right")
          } else {
            setShowSnapPreview(null)
          }

          animationFrameRef.current = undefined
        })
      }

      // Handle window resizing
      if (isResizing && resizeHandle && animationFrameRef.current === undefined && !isMobile) {
        animationFrameRef.current = requestAnimationFrame(() => {
          const deltaX = e.clientX - resizeStart.x
          const deltaY = e.clientY - resizeStart.y

          let newWidth = resizeStart.width
          let newHeight = resizeStart.height
          let newX = position.x
          let newY = position.y

          // Handle horizontal resizing
          if (resizeHandle.includes("e")) {
            newWidth = Math.max(minSize.width, resizeStart.width + deltaX)
          } else if (resizeHandle.includes("w")) {
            const widthChange = Math.min(deltaX, resizeStart.width - minSize.width)
            newWidth = resizeStart.width - widthChange
            newX = position.x + widthChange
          }

          // Handle vertical resizing
          if (resizeHandle.includes("s")) {
            newHeight = Math.max(minSize.height, resizeStart.height + deltaY)
          } else if (resizeHandle.includes("n")) {
            const heightChange = Math.min(deltaY, resizeStart.height - minSize.height)
            newHeight = resizeStart.height - heightChange
            newY = position.y + heightChange
          }

          // Ensure window stays within viewport
          newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX))
          newY = Math.max(0, Math.min(window.innerHeight - newHeight, newY))

          setSize({ width: newWidth, height: newHeight })
          setPosition({ x: newX, y: newY })
          onSizeChange?.({ width: newWidth, height: newHeight })
          onPositionChange?.({ x: newX, y: newY })

          animationFrameRef.current = undefined
        })
      }
    },
    [
      isDragging,
      isResizing,
      resizeHandle,
      dragOffset,
      resizeStart,
      size.width,
      size.height,
      position,
      tilingMode,
      onPositionChange,
      onSizeChange,
      isMobile,
      minSize.width,
      minSize.height,
    ],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".window-header")) {
      if (tilingMode === "normal" && !isMobile) {
        setIsDragging(true)
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
      onFocus()
      e.preventDefault()
    }
  }

  const handleMouseUp = useCallback(() => {
    if (isDragging && showSnapPreview) {
      // Apply snap on mouse release
      onTile?.(showSnapPreview)
      setShowSnapPreview(null)
    }

    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)

    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [isDragging, showSnapPreview, onTile])

  useEffect(() => {
    if ((isDragging || isResizing) && !isMobile) {
      document.addEventListener("mousemove", handleMouseMove, { passive: true })
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("mouseleave", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("mouseleave", handleMouseUp)
        if (animationFrameRef.current !== undefined) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, isMobile])

  const handleResizeStart = (handle: ResizeHandle, e: React.MouseEvent) => {
    if (tilingMode !== "normal" || isMobile) return

    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
    onFocus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleDoubleClick = () => {
    if (!isMobile) {
      if (tilingMode === "maximize") {
        onRestoreFromTiling?.()
      } else {
        onTile?.("maximize")
      }
    }
  }

  const getCursorStyle = (handle: ResizeHandle): string => {
    switch (handle) {
      case "n":
      case "s":
        return "cursor-ns-resize"
      case "e":
      case "w":
        return "cursor-ew-resize"
      case "ne":
      case "sw":
        return "cursor-nesw-resize"
      case "nw":
      case "se":
        return "cursor-nwse-resize"
      default:
        return ""
    }
  }

  if (isMinimized) {
    return null
  }

  if (isMobile) {
    return (
      <div
        className={`
          fixed inset-0 bg-background border-0 select-none overflow-hidden z-50
          ${isFocused ? "block" : "hidden"}
        `}
        role="dialog"
        aria-label={`${title} application window`}
        aria-modal="true"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between px-4 py-3 bg-muted/50 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
              aria-label={`Close ${title} window`}
              type="button"
            >
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <button
            onClick={onMinimize}
            className="w-9 h-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
            aria-label={`Minimize ${title} window`}
            type="button"
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-background" style={{ height: "calc(100vh - 64px)" }}>
          <div className="p-4">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <>
      {/* Snap Preview Overlay */}
      {showSnapPreview && (
        <div
          className="fixed pointer-events-none bg-primary/20 border-2 border-primary transition-all duration-150 z-[9999]"
          style={{
            left: showSnapPreview === "tile-right" ? "50%" : 0,
            top: 0,
            width: showSnapPreview === "maximize" ? "100%" : "50%",
            height: "calc(100vh - 100px)",
          }}
        />
      )}

      <div
        ref={windowRef}
        className={`
          absolute bg-background select-none overflow-hidden
          ${isFocused ? "shadow-2xl" : "shadow-lg opacity-90"}
          ${isDragging ? "cursor-grabbing transition-none" : "transition-all duration-200 ease-out"}
          ${tilingMode !== "normal" ? "rounded-none" : "rounded-lg"}
          ${isFocused ? "ring-1 ring-border/50" : "ring-1 ring-border/30"}
        `}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex: zIndex,
          transform: isDragging || isResizing ? "translateZ(0)" : "none",
          willChange: isDragging || isResizing ? "transform" : "auto",
          border: `1px solid ${isFocused ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.1)"}`,
        }}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-label={`${title} application window`}
        aria-modal="true"
      >
        {/* Resize Handles - Only show when window is in normal mode and not mobile */}
        {tilingMode === "normal" && !isMobile && (
          <>
            {/* Top */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "n" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("n", e)}
            />
            {/* Bottom */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "s" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("s", e)}
            />
            {/* Left */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "w" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("w", e)}
            />
            {/* Right */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "e" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("e", e)}
            />
            {/* Top-Left Corner */}
            <div
              className={`absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "nw" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("nw", e)}
            />
            {/* Top-Right Corner */}
            <div
              className={`absolute top-0 right-0 w-3 h-3 cursor-nesw-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "ne" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("ne", e)}
            />
            {/* Bottom-Left Corner */}
            <div
              className={`absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "sw" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("sw", e)}
            />
            {/* Bottom-Right Corner */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize hover:bg-primary/20 z-50 ${
                isResizing && resizeHandle === "se" ? "bg-primary/30" : ""
              }`}
              onMouseDown={(e) => handleResizeStart("se", e)}
            />
          </>
        )}

        {/* Title Bar - macOS/Windows Style */}
        <header
          className={`
            window-header flex items-center justify-between border-b
            ${isFocused ? "bg-muted/80 border-border/80" : "bg-muted/50 border-border/50"}
            ${isDragging ? "cursor-grabbing" : tilingMode === "normal" ? "cursor-grab" : "cursor-default"}
          `}
          style={{ height: HEADER_HEIGHT }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* macOS-style Traffic Lights - Left Side */}
          <div
            className="flex items-center gap-2 px-3"
            onMouseEnter={() => setMacControlsHovered(true)}
            onMouseLeave={() => setMacControlsHovered(false)}
          >
            {/* Close Button - Red */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="group w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 flex items-center justify-center transition-colors"
              aria-label={`Close ${title} window`}
              type="button"
            >
              {macControlsHovered && (
                <svg className="w-2 h-2 text-[#8B0000] opacity-0 group-hover:opacity-100" viewBox="0 0 12 12">
                  <path
                    d="M2 2 L10 10 M10 2 L2 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            {/* Minimize Button - Yellow */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMinimize()
              }}
              className="group w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center transition-colors"
              aria-label={`Minimize ${title} window`}
              type="button"
            >
              {macControlsHovered && (
                <svg className="w-2 h-2 text-[#995700] opacity-0 group-hover:opacity-100" viewBox="0 0 12 12">
                  <path d="M2 6 L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Maximize/Restore Button - Green */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (tilingMode === "maximize") {
                  onRestoreFromTiling?.()
                } else {
                  onTile?.("maximize")
                }
              }}
              className="group w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 flex items-center justify-center transition-colors"
              aria-label={tilingMode === "maximize" ? "Restore window" : "Maximize window"}
              type="button"
            >
              {macControlsHovered && (
                <svg className="w-2 h-2 text-[#006400] opacity-0 group-hover:opacity-100" viewBox="0 0 12 12">
                  {tilingMode === "maximize" ? (
                    <>
                      <path
                        d="M3 3 L9 3 L9 9 L3 9 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path d="M5 5 L7 7 M7 5 L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M3 5 L6 2 L9 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M3 7 L6 10 L9 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              )}
            </button>
          </div>

          {/* Window Title - Center */}
          <div className="flex-1 flex items-center justify-center px-4">
            <h1
              className={`text-xs font-medium select-none ${
                isFocused ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {title}
            </h1>
          </div>

          {/* Windows-style Controls - Right Side (Hidden for cleaner Mac look, can be toggled) */}
          <div className="opacity-0 w-24" aria-hidden="true">
            {/* Spacer for symmetry */}
          </div>
        </header>

        {/* Menu Bar - Native App Style */}
        <div
          className={`flex items-center px-3 border-b text-xs ${
            isFocused
              ? "bg-background border-border/60 text-foreground"
              : "bg-background/80 border-border/40 text-muted-foreground"
          }`}
          style={{ height: MENU_BAR_HEIGHT }}
        >
          <button className="px-2 py-1 hover:bg-muted rounded transition-colors" type="button">
            File
          </button>
          <button className="px-2 py-1 hover:bg-muted rounded transition-colors" type="button">
            Edit
          </button>
          <button className="px-2 py-1 hover:bg-muted rounded transition-colors" type="button">
            View
          </button>
          <button className="px-2 py-1 hover:bg-muted rounded transition-colors" type="button">
            Window
          </button>
          <button className="px-2 py-1 hover:bg-muted rounded transition-colors" type="button">
            Help
          </button>

          {/* Tiling mode indicator */}
          {tilingMode !== "normal" && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-primary/10 rounded text-primary font-medium">
                {tilingMode === "tile-left" && "Left Half"}
                {tilingMode === "tile-right" && "Right Half"}
                {tilingMode === "maximize" && "Maximized"}
              </span>
            </div>
          )}
        </div>

        {/* Window Content */}
        <main
          className="overflow-auto bg-background"
          style={{ height: `calc(100% - ${HEADER_HEIGHT + MENU_BAR_HEIGHT}px)` }}
        >
          {children}
        </main>
      </div>
    </>
  )
}
