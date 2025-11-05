"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type { TilingMode } from "@/hooks/use-window-manager"
import { useMobile } from "@/hooks/use-mobile" // Added mobile detection

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
  onTile?: (mode: TilingMode) => void
  onRestoreFromTiling?: () => void
}

export function Window({
  appId,
  title,
  children,
  initialSize = { width: 600, height: 400 },
  initialPosition = { x: 100, y: 100 },
  isMinimized = false,
  isFocused = false,
  zIndex = 1,
  tilingMode = "normal",
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  onTile,
  onRestoreFromTiling,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const isMobile = useMobile() // Added mobile detection

  useEffect(() => {
    if (!isMobile) {
      setPosition(initialPosition)
      setSize(initialSize)
    }
  }, [initialPosition, initialSize, isMobile])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && animationFrameRef.current === undefined && tilingMode === "normal" && !isMobile) {
        animationFrameRef.current = requestAnimationFrame(() => {
          const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x))
          const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
          const newPosition = { x: newX, y: newY }
          setPosition(newPosition)
          onPositionChange?.(newPosition)
          animationFrameRef.current = undefined
        })
      }
    },
    [isDragging, dragOffset, size.width, size.height, tilingMode, onPositionChange, isMobile],
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
    setIsDragging(false)
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [])

  useEffect(() => {
    if (isDragging && !isMobile) {
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
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile])

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

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto bg-background" style={{ height: "calc(100vh - 64px)" }}>
          <div className="p-4">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div
      ref={windowRef}
      className={`
        absolute bg-card border border-border select-none overflow-hidden backdrop-blur-xl
        ${isFocused ? "shadow-lg ring-1 ring-primary/20" : "shadow-md opacity-95"}
        ${isDragging ? "cursor-grabbing transition-none" : "cursor-default transition-all duration-300 ease-out"}
        ${tilingMode !== "normal" ? "rounded-none" : "rounded-xl"}
      `}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        transform: isDragging ? "translateZ(0)" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-label={`${title} application window`}
      aria-modal="true"
    >
      <header
        className={`
          window-header flex items-center justify-between px-4 py-2.5 bg-muted/50 backdrop-blur-sm border-b border-border
          ${isDragging ? "cursor-grabbing" : tilingMode === "normal" ? "cursor-grab" : "cursor-default"}
        `}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          {/* Tiling mode indicator */}
          {tilingMode !== "normal" && (
            <span
              className="text-xs px-2 py-0.5 bg-primary/10 rounded-md text-primary font-medium"
              aria-label={`Window is ${tilingMode}`}
            >
              {tilingMode === "tile-left" && "◐"}
              {tilingMode === "tile-right" && "◑"}
              {tilingMode === "maximize" && "⬜"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5" role="group" aria-label="Window controls">
          {/* Tiling control buttons */}
          {tilingMode !== "normal" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRestoreFromTiling?.()
              }}
              className="w-7 h-7 rounded-md hover:bg-muted transition-colors duration-150 flex items-center justify-center group"
              aria-label={`Restore ${title} window to normal size`}
              title="Restore window"
              type="button"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground" aria-hidden="true">
                ⧉
              </span>
            </button>
          )}

          {/* Minimize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className="w-7 h-7 rounded-md hover:bg-muted transition-colors duration-150 flex items-center justify-center group"
            aria-label={`Minimize ${title} window`}
            type="button"
          >
            <span className="text-sm text-muted-foreground group-hover:text-foreground" aria-hidden="true">
              −
            </span>
          </button>
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="w-7 h-7 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-150 flex items-center justify-center group"
            aria-label={`Close ${title} window`}
            type="button"
          >
            <span className="text-sm text-muted-foreground group-hover:text-destructive" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
      </header>

      {/* Window Content */}
      <main className="h-full overflow-auto bg-card" style={{ height: size.height - 60 }}>
        {children}
      </main>
    </div>
  )
}
