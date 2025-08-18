"use client"

import { useState } from "react"
import { Desktop } from "@/components/desktop/Desktop"
import { DesktopIconGrid } from "@/components/desktop/DesktopIconGrid"
import { Dock } from "@/components/desktop/Dock"
import { Window } from "@/components/desktop/Window"
import { CommandPalette, type CommandAction } from "@/components/command/CommandPalette"
import { KeyboardShortcutsHelp } from "@/components/desktop/KeyboardShortcutsHelp"
import { useWindowManager } from "@/hooks/use-window-manager"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useFocusManagement } from "@/hooks/use-focus-management"
import { apps } from "@/data/apps"
import { getAppById } from "@/lib/app-registry"

export default function HomePage() {
  const {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    getRunningApps,
    getWindowByAppId,
  } = useWindowManager()

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)
  const { setFocus } = useFocusManagement()
  const runningApps = getRunningApps()

  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      description: "Open Command Palette",
      action: () => setCommandPaletteOpen(true),
    },
    {
      key: "k",
      ctrlKey: true,
      description: "Open Command Palette (Windows/Linux)",
      action: () => setCommandPaletteOpen(true),
    },
    {
      key: "1",
      altKey: true,
      description: "Open About",
      action: () => handleOpenApp("about"),
    },
    {
      key: "2",
      altKey: true,
      description: "Open Projects",
      action: () => handleOpenApp("projects"),
    },
    {
      key: "3",
      altKey: true,
      description: "Open Skills",
      action: () => handleOpenApp("skills"),
    },
    {
      key: "4",
      altKey: true,
      description: "Open Contact",
      action: () => handleOpenApp("contact"),
    },
    {
      key: "w",
      metaKey: true,
      description: "Close Focused Window",
      action: () => {
        const focusedWindow = windows.find((w) => w.isFocused)
        if (focusedWindow) {
          closeWindow(focusedWindow.id)
        }
      },
    },
    {
      key: "m",
      metaKey: true,
      description: "Minimize Focused Window",
      action: () => {
        const focusedWindow = windows.find((w) => w.isFocused)
        if (focusedWindow) {
          minimizeWindow(focusedWindow.id)
        }
      },
    },
    {
      key: "/",
      metaKey: true,
      description: "Show Keyboard Shortcuts",
      action: () => setShortcutsHelpOpen(true),
    },
    {
      key: "?",
      description: "Show Keyboard Shortcuts",
      action: () => setShortcutsHelpOpen(true),
    },
  ])

  const handleOpenApp = (appId: string) => {
    const app = apps.find((a) => a.id === appId)
    if (app) {
      openWindow(appId, app.title)
    }
  }

  const handleAppSelect = (appId: string) => {
    const window = getWindowByAppId(appId)
    if (window) {
      if (window.isMinimized) {
        restoreWindow(window.id)
      } else {
        focusWindow(window.id)
      }
    }
  }

  const handleSystemAction = (action: string) => {
    if (action === "help") {
      setShortcutsHelpOpen(true)
    }
    console.log(`System action: ${action}`)
  }

  const handleCommandExecute = (command: CommandAction) => {
    switch (command.category) {
      case "app":
        handleOpenApp(command.payload.appId)
        break
      case "project":
        handleOpenApp("projects")
        console.log("Selected project:", command.payload.project)
        break
      case "skill":
        handleOpenApp("skills")
        console.log("Selected skill:", command.payload.skill)
        break
      case "action":
        switch (command.payload.action) {
          case "close-all":
            windows.forEach((window) => closeWindow(window.id))
            break
          case "minimize-all":
            windows.forEach((window) => minimizeWindow(window.id))
            break
          case "filter-projects":
            handleOpenApp("projects")
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("projects-filter", {
                  detail: { tag: command.payload.tag },
                }),
              )
            }, 100)
            break
        }
        break
    }
  }

  const renderWindowContent = (appId: string) => {
    const app = getAppById(appId)
    if (app) {
      const Component = app.component
      return <Component />
    }
    return <div>Unknown app: {appId}</div>
  }

  return (
    <Desktop>
      {/* Desktop Icons Grid with keyboard navigation */}
      <DesktopIconGrid apps={apps} onOpenApp={handleOpenApp} />

      {/* Status Bar with help hint */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black text-white neo-border px-4 py-2">
          <div className="text-sm font-mono">⌘K: Command • ⌘/: Help • Alt+1-4: Apps</div>
        </div>
      </div>

      {/* Windows Layer */}
      {windows.map((window) => (
        <Window
          key={window.id}
          appId={window.appId}
          title={window.title}
          initialSize={window.size}
          initialPosition={window.position}
          isMinimized={window.isMinimized}
          isFocused={window.isFocused}
          zIndex={window.zIndex}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
        >
          {renderWindowContent(window.appId)}
        </Window>
      ))}

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} onExecute={handleCommandExecute} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isVisible={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} />

      {/* Dock */}
      <Dock runningApps={runningApps} onAppSelect={handleAppSelect} onSystemAction={handleSystemAction} />

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-20 left-4 bg-black text-white p-2 text-xs font-mono z-50">
          <div>Running: {runningApps.join(", ") || "none"}</div>
          <div>Windows: {windows.length}</div>
          <div>Focused: {windows.find((w) => w.isFocused)?.appId || "none"}</div>
        </div>
      )}
    </Desktop>
  )
}
