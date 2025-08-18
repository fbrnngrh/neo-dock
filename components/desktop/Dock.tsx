"use client"

interface DockProps {
  runningApps: string[]
  onAppSelect: (appId: string) => void
  onSystemAction?: (action: string) => void
}

const AppIcon = ({ type }: { type: string }) => {
  const iconProps = {
    width: 24,
    height: 24,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (type) {
    case "about":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case "projects":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )
    case "skills":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )
    case "contact":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      )
    case "system":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      )
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

export function Dock({ runningApps, onAppSelect, onSystemAction }: DockProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-full px-8 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSystemAction?.("menu")}
            className="text-neo-fg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-focus rounded-lg p-2 hover:bg-neo-bg2"
            aria-label="System menu"
          >
            <AppIcon type="system" />
          </button>

          <div className="w-px h-6 bg-neo-border opacity-30"></div>

          {/* Running apps */}
          {runningApps.length > 0 ? (
            <div className="flex items-center gap-3">
              {runningApps.map((appId) => (
                <button
                  key={appId}
                  onClick={() => onAppSelect(appId)}
                  className="relative text-neo-fg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-focus rounded-lg p-2 hover:bg-neo-bg2"
                  aria-label={`Focus ${appId} window`}
                >
                  <AppIcon type={appId} />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-neo-fg rounded-full"></div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-bold text-neo-fg tracking-wider">NEO-OS</div>
          )}
        </div>
      </div>
    </div>
  )
}
