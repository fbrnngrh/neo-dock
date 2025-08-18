"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

interface WindowProps {
  appId: string
  title: string
  children: React.ReactNode
  initialSize?: { width: number; height: number }
  initialPosition?: { x: number; y: number }
  isMinimized?: boolean
  isFocused?: boolean
  zIndex?: number
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
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
  onClose,
  onMinimize,
  onFocus,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && animationFrameRef.current === undefined) {
        animationFrameRef.current = requestAnimationFrame(() => {
          const newX = Math.max(0, Math.min(window.innerWidth - initialSize.width, e.clientX - dragOffset.x))
          const newY = Math.max(0, Math.min(window.innerHeight - initialSize.height, e.clientY - dragOffset.y))
          setPosition({ x: newX, y: newY })
          animationFrameRef.current = undefined
        })
      }
    },
    [isDragging, dragOffset, initialSize.width, initialSize.height],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".window-header")) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
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
    if (isDragging) {
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
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  if (isMinimized) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={`
        absolute bg-neo-bg border-2 border-neo-border rounded-xl select-none overflow-hidden backdrop-blur-sm
        ${isFocused ? "shadow-neo" : "shadow-[2px_2px_0_0_var(--neo-shadow)] opacity-95"}
        ${isDragging ? "cursor-grabbing transition-none" : "cursor-default transition-all duration-300 ease-out"}
      `}
      style={{
        left: position.x,
        top: position.y,
        width: initialSize.width,
        height: initialSize.height,
        zIndex: zIndex,
        transform: isDragging ? "translateZ(0)" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-label={`${title} window`}
    >
      {/* Window Header */}
      <div
        className={`
          window-header flex items-center justify-between px-4 py-3 bg-neo-fg text-neo-bg border-b border-neo-border/20
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold tracking-wide">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Minimize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className="w-6 h-6 bg-neo-bg border border-neo-border/30 rounded-md hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 neo-focus flex items-center justify-center hover:bg-neo-bg2"
            aria-label="Minimize window"
          >
            <span className="text-xs font-bold text-neo-fg">−</span>
          </button>
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="w-6 h-6 bg-neo-bg border border-neo-border/30 rounded-md hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 neo-focus flex items-center justify-center hover:bg-neo-bg2"
            aria-label="Close window"
          >
            <span className="text-xs font-bold text-neo-fg">×</span>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-auto p-6 bg-neo-bg" style={{ height: initialSize.height - 60 }}>
        {children}
      </div>
    </div>
  )
}
