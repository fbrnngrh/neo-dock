"use client"

import { useState, useEffect, useRef } from "react"
import { AppIcon } from "./AppIcon"
import type { AppRegistryItem } from "@/data/apps"

interface DesktopIconGridProps {
  apps: AppRegistryItem[]
  onOpenApp: (appId: string) => void
}

export function DesktopIconGrid({ apps, onOpenApp }: DesktopIconGridProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when not in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.closest('[role="dialog"]')
      ) {
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setIsKeyboardMode(true)
          setSelectedIndex((prev) => Math.min(prev + 1, apps.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setIsKeyboardMode(true)
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
        case " ":
          if (isKeyboardMode) {
            e.preventDefault()
            onOpenApp(apps[selectedIndex].id)
          }
          break
        case "Escape":
          setIsKeyboardMode(false)
          setSelectedIndex(0)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [apps, selectedIndex, isKeyboardMode, onOpenApp])

  // Focus the selected icon when in keyboard mode
  useEffect(() => {
    if (isKeyboardMode && gridRef.current) {
      const selectedButton = gridRef.current.children[selectedIndex] as HTMLElement
      selectedButton?.focus()
    }
  }, [selectedIndex, isKeyboardMode])

  const handleMouseEnter = () => {
    setIsKeyboardMode(false)
  }

  return (
    <div ref={gridRef} className="absolute top-8 left-8 grid grid-cols-1 gap-6 z-10" onMouseEnter={handleMouseEnter}>
      {apps.map((app, index) => (
        <AppIcon
          key={app.id}
          appId={app.id}
          title={app.title}
          icon={app.icon}
          onOpen={onOpenApp}
          isSelected={isKeyboardMode && index === selectedIndex}
          id={`desktop-icon-${app.id}`}
        />
      ))}
    </div>
  )
}
