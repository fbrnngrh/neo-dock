"use client"

import { useState, useEffect } from "react"
import { Desktop } from "@/components/desktop/Desktop"
import { Dock } from "@/components/desktop/Dock"
import { Window } from "@/components/desktop/Window"
import { AnimatedEyes } from "@/components/desktop/AnimatedEyes"
import { CommandPalette, type CommandAction } from "@/components/command/CommandPalette"
import { KeyboardShortcutsHelp } from "@/components/desktop/KeyboardShortcutsHelp"
import { useWindowManager } from "@/hooks/use-window-manager"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useFocusManagement } from "@/hooks/use-focus-management"
import { useMobile } from "@/hooks/use-mobile" // Added mobile detection
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
    tileWindow,
    restoreFromTiling,
    updateWindowPosition,
    closeAllWindows,
    minimizeAllWindows,
    focusNextWindow,
    getRunningApps,
    getMinimizedApps,
    getVisibleWindows,
    getWindowByAppId,
    getFocusedWindow,
  } = useWindowManager()

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)
  const { setFocus } = useFocusManagement()
  const isMobile = useMobile() // Added mobile detection
  const runningApps = getRunningApps()
  const minimizedApps = getMinimizedApps()

  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      shiftKey: true,
      description: "Open Command Palette",
      action: () => setCommandPaletteOpen(true),
    },
    {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
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
      key: "5",
      altKey: true,
      description: "Open IDE",
      action: () => handleOpenApp("ide"),
    },
    {
      key: "6",
      altKey: true,
      description: "Open Terminal",
      action: () => handleOpenApp("terminal"),
    },
    {
      key: "w",
      altKey: true,
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
      altKey: true,
      description: "Minimize Focused Window",
      action: () => {
        const focusedWindow = windows.find((w) => w.isFocused)
        if (focusedWindow) {
          minimizeWindow(focusedWindow.id)
        }
      },
    },
    {
      key: "Tab",
      altKey: true,
      description: "Focus Next Window",
      action: () => focusNextWindow(),
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
    ...(isMobile
      ? []
      : [
          {
            key: "ArrowLeft",
            altKey: true,
            description: "Tile Window Left",
            action: () => {
              const focusedWindow = getFocusedWindow()
              if (focusedWindow) {
                tileWindow(focusedWindow.id, "tile-left")
              }
            },
          },
          {
            key: "ArrowRight",
            altKey: true,
            description: "Tile Window Right",
            action: () => {
              const focusedWindow = getFocusedWindow()
              if (focusedWindow) {
                tileWindow(focusedWindow.id, "tile-right")
              }
            },
          },
          {
            key: "ArrowUp",
            altKey: true,
            description: "Maximize Window",
            action: () => {
              const focusedWindow = getFocusedWindow()
              if (focusedWindow) {
                tileWindow(focusedWindow.id, "maximize")
              }
            },
          },
          {
            key: "ArrowDown",
            altKey: true,
            description: "Restore Window",
            action: () => {
              const focusedWindow = getFocusedWindow()
              if (focusedWindow && focusedWindow.tilingMode !== "normal") {
                restoreFromTiling(focusedWindow.id)
              }
            },
          },
        ]),
  ])

  useEffect(() => {
    const handleTerminalOpenApp = (event: CustomEvent) => {
      handleOpenApp(event.detail.appId)
    }

    const handleTerminalCloseAllWindows = () => {
      closeAllWindows()
    }

    const handleTerminalFocusNextWindow = () => {
      focusNextWindow()
    }

    window.addEventListener("terminal-open-app", handleTerminalOpenApp as EventListener)
    window.addEventListener("terminal-close-all-windows", handleTerminalCloseAllWindows)
    window.addEventListener("terminal-focus-next-window", handleTerminalFocusNextWindow)

    return () => {
      window.removeEventListener("terminal-open-app", handleTerminalOpenApp as EventListener)
      window.removeEventListener("terminal-close-all-windows", handleTerminalCloseAllWindows)
      window.removeEventListener("terminal-focus-next-window", handleTerminalFocusNextWindow)
    }
  }, [closeAllWindows, focusNextWindow])

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
            closeAllWindows()
            break
          case "minimize-all":
            minimizeAllWindows()
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
      {/* Status Bar with help hint - hide on mobile when windows are open */}
      {(!isMobile || getVisibleWindows().length === 0) && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black text-white neo-border px-4 py-2">
            <div className={`font-mono ${isMobile ? "text-xs" : "text-sm"}`}>
              {isMobile ? "Tap dock apps to open" : "⌘⇧K: Command • ⌘/: Help • Alt+1-6: Apps"}
            </div>
          </div>
        </div>
      )}

      {/* Windows Layer */}
      {getVisibleWindows().map((window) => (
        <Window
          key={window.id}
          appId={window.appId}
          title={window.title}
          initialSize={window.size}
          initialPosition={window.position}
          isMinimized={window.isMinimized}
          isFocused={window.isFocused}
          zIndex={window.zIndex}
          tilingMode={window.tilingMode}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onPositionChange={(position) => updateWindowPosition(window.id, position)}
          onTile={(mode) => !isMobile && tileWindow(window.id, mode)}
          onRestoreFromTiling={() => !isMobile && restoreFromTiling(window.id)}
        >
          {renderWindowContent(window.appId)}
        </Window>
      ))}

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} onExecute={handleCommandExecute} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isVisible={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} />

      {/* Animated Eyes - hide on mobile */}
      {!isMobile && <AnimatedEyes />}

      <Dock
        runningApps={runningApps}
        minimizedApps={minimizedApps}
        onAppSelect={handleAppSelect}
        onSystemAction={handleSystemAction}
        apps={apps}
        onOpenApp={handleOpenApp}
      />

      {/* Debug info - hide on mobile */}
      {process.env.NODE_ENV === "development" && !isMobile && (
        <div className="absolute bottom-20 left-4 bg-black text-white p-2 text-xs font-mono z-50">
          <div>Running: {runningApps.join(", ") || "none"}</div>
          <div>Minimized: {minimizedApps.join(", ") || "none"}</div>
          <div>Windows: {windows.length}</div>
          <div>Focused: {windows.find((w) => w.isFocused)?.appId || "none"}</div>
        </div>
      )}
    </Desktop>
  )
}
