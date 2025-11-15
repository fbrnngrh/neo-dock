"use client"

import { useMobile } from "@/hooks/use-mobile"

interface DockProps {
  runningApps: string[]
  minimizedApps: string[]
  onAppSelect: (appId: string) => void
  onSystemAction?: (action: string) => void
  apps: Array<{ id: string; title: string }>
  onOpenApp: (appId: string) => void
}

const AppIcon = ({ type }: { type: string }) => {
  // Neobrutalism color palette - vibrant and bold
  const colors = {
    about: "#60A5FA", // Blue
    projects: "#A855F7", // Purple
    skills: "#FB923C", // Orange
    contact: "#F472B6", // Pink
    ide: "#3B82F6", // Deep Blue
    terminal: "#34D399", // Green
    system: "#94A3B8", // Gray
  }

  const color = colors[type as keyof typeof colors] || colors.system

  switch (type) {
    case "about":
      return (
        <div className="relative w-12 h-12 bg-[#60A5FA] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* User icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-4 h-4 bg-white border-2 border-black rounded-full mb-1" />
            <div className="w-6 h-3 bg-white border-2 border-black border-t-0 rounded-b-full" />
          </div>
        </div>
      )
    case "projects":
      return (
        <div className="relative w-12 h-12 bg-[#A855F7] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Folder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-7 h-6">
              {/* Folder tab */}
              <div className="absolute top-0 left-0 w-4 h-2 bg-white border-2 border-black border-b-0 rounded-t-sm" />
              {/* Folder body */}
              <div className="absolute top-1.5 left-0 w-7 h-4 bg-white border-2 border-black rounded-sm" />
              {/* Checkmark */}
              <div className="absolute top-2.5 left-1 w-1.5 h-0.5 bg-black rotate-45" />
              <div className="absolute top-2 left-2 w-2.5 h-0.5 bg-black -rotate-45" />
            </div>
          </div>
        </div>
      )
    case "skills":
      return (
        <div className="relative w-12 h-12 bg-[#FB923C] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Star/sparkle icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-6 h-6">
              {/* Center star */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-black rotate-45" />
              {/* Points */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-white border-2 border-black" />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-white border-2 border-black" />
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-white border-2 border-black" />
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-white border-2 border-black" />
            </div>
          </div>
        </div>
      )
    case "contact":
      return (
        <div className="relative w-12 h-12 bg-[#F472B6] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Mail icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-7 h-5">
              {/* Envelope */}
              <div className="absolute inset-0 bg-white border-2 border-black rounded-sm" />
              {/* Envelope flap */}
              <div className="absolute top-0 left-0 right-0 h-2.5 overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#F472B6] border-2 border-black rotate-45 -mt-3.5" />
              </div>
            </div>
          </div>
        </div>
      )
    case "ide":
      return (
        <div className="relative w-12 h-12 bg-[#3B82F6] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Code icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-7 h-6">
              {/* Code brackets */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 border-l-2 border-t-2 border-b-2 border-white" />
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 border-r-2 border-t-2 border-b-2 border-white" />
              {/* Slash */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rotate-12" />
            </div>
          </div>
        </div>
      )
    case "terminal":
      return (
        <div className="relative w-12 h-12 bg-[#34D399] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Terminal icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-7 h-6">
              {/* Terminal window */}
              <div className="absolute inset-0 bg-black rounded-sm" />
              {/* Command prompt */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
                <div className="w-1.5 h-1.5 border-l-2 border-b-2 border-white transform rotate-45 -ml-0.5" />
              </div>
              {/* Cursor */}
              <div className="absolute right-1.5 bottom-1.5 w-2 h-0.5 bg-white" />
            </div>
          </div>
        </div>
      )
    case "system":
      return (
        <div className="relative w-12 h-12 bg-[#94A3B8] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          {/* Grid/apps icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-white border-2 border-black" />
              <div className="w-2 h-2 bg-white border-2 border-black" />
              <div className="w-2 h-2 bg-white border-2 border-black" />
              <div className="w-2 h-2 bg-white border-2 border-black" />
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="relative w-12 h-12 bg-[#94A3B8] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white border-2 border-black rounded-full" />
          </div>
        </div>
      )
  }
}

export function Dock({ runningApps, minimizedApps, onAppSelect, onSystemAction, apps, onOpenApp }: DockProps) {
  const isMobile = useMobile()

  return (
    <nav
      role="navigation"
      aria-label="Application dock"
      className={`
        absolute left-1/2 transform -translate-x-1/2 z-50
        ${isMobile ? "bottom-2" : "bottom-6"}
      `}
    >
      <div
        className={`
          bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          ${isMobile ? "rounded-2xl px-4 py-3" : "rounded-3xl px-6 py-4"}
          transition-all duration-200
        `}
      >
        <div className={`flex items-center ${isMobile ? "gap-3" : "gap-4"}`}>
          {/* App Icons */}
          <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`} role="group" aria-label="Applications">
            {apps.map((app) => {
              const isRunning = runningApps.includes(app.id)
              const isMinimized = minimizedApps.includes(app.id)

              return (
                <div key={app.id} className="relative">
                  <button
                    onClick={() => {
                      if (isRunning) {
                        onAppSelect(app.id)
                      } else {
                        onOpenApp(app.id)
                      }
                    }}
                    className={`
                      relative transition-transform duration-150 active:scale-95
                      ${isMobile ? "" : ""}
                    `}
                    aria-label={isRunning ? `${isMinimized ? "Restore" : "Focus"} ${app.title}` : `Open ${app.title}`}
                    aria-pressed={isRunning && !isMinimized}
                    role="button"
                    tabIndex={0}
                  >
                    <AppIcon type={app.id} />
                  </button>

                  {/* Running indicator - Neobrutalism style */}
                  {isRunning && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {isMinimized ? (
                        // Minimized: Bold square indicator
                        <div className="w-3 h-3 bg-black border-2 border-black rotate-45" />
                      ) : (
                        // Running: Bold dot indicator
                        <div className="w-2.5 h-2.5 bg-black rounded-full border-2 border-black" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Separator */}
          <div className={`bg-black ${isMobile ? "w-1 h-10" : "w-1 h-12"} rounded-full`} aria-hidden="true"></div>

          {/* System Button */}
          <button
            onClick={() => onSystemAction?.("menu")}
            className="relative transition-transform duration-150 active:scale-95"
            aria-label="Open system menu"
            role="button"
            tabIndex={0}
          >
            <AppIcon type="system" />
          </button>

          {/* Branding - only show when no apps running */}
          {runningApps.length === 0 && (
            <>
              <div className={`bg-black ${isMobile ? "w-1 h-10" : "w-1 h-12"} rounded-full`} aria-hidden="true"></div>
              <div
                className={`font-black text-black tracking-tighter ${isMobile ? "text-lg" : "text-xl"}`}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                }}
                aria-label="Neo-Dock branding"
              >
                NEO-DOCK
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dock platform base - like macOS */}
      <div className={`
        absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
        ${isMobile ? "w-32 h-1" : "w-48 h-1"}
        bg-black/20 rounded-full blur-sm
      `} aria-hidden="true" />
    </nav>
  )
}
