"use client"

interface KeyboardShortcutsHelpProps {
  isVisible: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isVisible, onClose }: KeyboardShortcutsHelpProps) {
  if (!isVisible) return null

  const shortcuts = [
    { keys: ["⌘", "K"], description: "Open Command Palette" },
    { keys: ["Alt", "1"], description: "Open About" },
    { keys: ["Alt", "2"], description: "Open Projects" },
    { keys: ["Alt", "3"], description: "Open Skills" },
    { keys: ["Alt", "4"], description: "Open Contact" },
    { keys: ["↑", "↓"], description: "Navigate Desktop Icons" },
    { keys: ["Enter"], description: "Open Selected App" },
    { keys: ["Esc"], description: "Close Window/Dialog" },
    { keys: ["Tab"], description: "Navigate Focus" },
    { keys: ["⌘", "W"], description: "Close Focused Window" },
    { keys: ["⌘", "M"], description: "Minimize Focused Window" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none w-full max-w-md mx-4">
        <div className="p-4 border-b-4 border-neo-border bg-neo-fg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neo-bg">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-neo-bg border-2 border-neo-border rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-focus flex items-center justify-center"
              aria-label="Close shortcuts help"
            >
              <span className="text-xs font-bold text-neo-fg">×</span>
            </button>
          </div>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-neo-fg">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span
                      key={keyIndex}
                      className="bg-neo-bg2 border-2 border-neo-border rounded-none px-2 py-1 text-xs font-bold font-mono text-neo-fg"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t-4 border-neo-border bg-neo-bg3 text-xs text-neo-fg-muted">
          Press <span className="font-bold text-neo-fg">Esc</span> or click × to close
        </div>
      </div>
    </div>
  )
}
