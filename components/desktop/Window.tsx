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
  isMaximized?: boolean
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  onPositionChange?: (position: { x: number; y: number }) => void
  onTile?: (mode: TilingMode) => void
  onRestoreFromTiling?: () => void
  onMaximize?: () => void
  onRestoreFromMaximize?: () => void
  onToggleMaximize?: () => void
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
  isMaximized = false,
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  onTile,
  onRestoreFromTiling,
  onMaximize,
  onRestoreFromMaximize,
  onToggleMaximize,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const isMobile = useMobile()

  useEffect(() => {
    if (!isMobile) {
      setPosition(initialPosition)
      setSize(initialSize)
    }
  }, [initialPosition, initialSize, isMobile])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        isDragging &&
        animationFrameRef.current === undefined &&
        tilingMode === "normal" &&
        !isMaximized &&
        !isMobile
      ) {
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
    [isDragging, dragOffset, size.width, size.height, tilingMode, isMaximized, onPositionChange, isMobile],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".window-header")) {
      if (tilingMode === "normal" && !isMaximized && !isMobile) {
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
      onToggleMaximize?.()
    }
  }

  if (isMinimized) {
    return null
  }

  if (isMobile) {
    return (
      <div
        className={`
          fixed inset-0 bg-neo-bg border-0 select-none overflow-hidden backdrop-blur-sm z-50
          ${isFocused ? "block" : "hidden"}
        `}
        style={{
          height: "100dvh",
          minHeight: "100vh", // Fallback for browsers without dvh support
        }}
        role="dialog"
        aria-label={`${title} application window`}
        aria-modal="true"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between px-4 py-4 bg-neo-fg text-neo-bg border-b-4 border-neo-border min-h-[72px]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-12 h-12 bg-neo-bg border-4 border-neo-border rounded-none hover:bg-neo-bg2 transition-colors focus:outline-none focus:ring-4 focus:ring-neo-border flex items-center justify-center"
              aria-label={`Close ${title} window`}
              type="button"
            >
              <svg
                className="w-6 h-6 text-neo-fg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wide">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMaximize}
              className="w-12 h-12 bg-neo-bg border-4 border-neo-border rounded-none hover:bg-neo-bg2 transition-colors focus:outline-none focus:ring-4 focus:ring-neo-border flex items-center justify-center"
              aria-label="Maximize window"
              aria-pressed={isMaximized}
              type="button"
            >
              <svg
                className="w-6 h-6 text-neo-fg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2"
                />
              </svg>
            </button>
            <button
              onClick={onMinimize}
              className="w-12 h-12 bg-neo-bg border-4 border-neo-border rounded-none hover:bg-neo-bg2 transition-colors focus:outline-none focus:ring-4 focus:ring-neo-border flex items-center justify-center"
              aria-label={`Minimize ${title} window`}
              type="button"
            >
              <svg
                className="w-6 h-6 text-neo-fg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </header>

        <main
          className="flex-1 overflow-auto bg-neo-bg"
          style={{
            height: "calc(100dvh - 72px)",
            minHeight: "calc(100vh - 72px)", // Fallback
          }}
        >
          <div className="p-4">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div
      ref={windowRef}
      className={`
        absolute bg-neo-bg border-4 border-black select-none overflow-hidden backdrop-blur-sm
        ${isFocused ? "shadow-[8px_8px_0_0_#000]" : "shadow-[4px_4px_0_0_#000] opacity-95"}
        ${isDragging ? "cursor-grabbing transition-none" : "cursor-default transition-all duration-200 ease-out"}
        rounded-none
      `}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        transform: isDragging ? "translateZ(0)" : "none",
        willChange: isDragging ? "transform" : "auto",
        boxShadow: isMaximized ? "none" : isFocused ? "8px 8px 0 0 #000" : "4px 4px 0 0 #000",
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
          window-header flex items-center justify-between px-4 py-3 bg-black text-white border-b-4 border-black
          ${isDragging ? "cursor-grabbing" : (tilingMode === "normal" && !isMaximized) ? "cursor-grab" : "cursor-default"}
        `}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold tracking-wide">{title}</h1>
          {tilingMode !== "normal" && (
            <span
              className="text-xs px-2 py-1 bg-white/20 text-white/80 font-bold"
              aria-label={`Window is ${tilingMode}`}
            >
              {tilingMode === "tile-left" && "◐"}
              {tilingMode === "tile-right" && "◑"}
              {tilingMode === "maximize" && "⬜"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Window controls">
          {tilingMode !== "normal" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRestoreFromTiling?.()
              }}
              className="w-6 h-6 bg-white border-2 border-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black flex items-center justify-center"
              aria-label={`Restore ${title} window to normal size`}
              title="Restore window"
              type="button"
            >
              <span className="text-xs font-bold text-black" aria-hidden="true">
                ⧉
              </span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className="w-6 h-6 bg-white border-2 border-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black flex items-center justify-center"
            aria-label={`Minimize ${title} window`}
            type="button"
          >
            <span className="text-xs font-bold text-black" aria-hidden="true">
              −
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleMaximize?.()
            }}
            className="w-6 h-6 bg-white border-2 border-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black flex items-center justify-center"
            aria-label="Maximize window"
            aria-pressed={isMaximized}
            title="Maximize (Alt+Up) / Restore (Alt+Down)"
            type="button"
          >
            <span className="text-xs font-bold text-black" aria-hidden="true">
              {isMaximized ? "⧉" : "⬜"}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="w-6 h-6 bg-white border-2 border-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black flex items-center justify-center"
            aria-label={`Close ${title} window`}
            type="button"
          >
            <span className="text-xs font-bold text-black" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
      </header>

      <main className="h-full overflow-auto bg-white" style={{ height: size.height - 60 }}>
        {children}
      </main>
    </div>
  )
}
