"use client"

interface StatusBarProps {
  activeFile?: string
  projectFilterMode: "and" | "or"
  onFilterModeToggle: () => void
}

export function StatusBar({ activeFile, projectFilterMode, onFilterModeToggle }: StatusBarProps) {
  return (
    <div className="h-8 bg-neo-bg2 border-t-2 border-neo-fg flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        <span className="font-bold text-neo-fg uppercase tracking-wider">WORKSPACE: Portfolio</span>
        {activeFile && <span className="text-neo-fg opacity-80">{activeFile}</span>}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onFilterModeToggle}
          className="flex items-center gap-2 px-2 py-1 bg-neo-bg border border-neo-fg rounded hover:bg-neo-bg3 transition-colors"
        >
          <span className="text-neo-fg font-medium">Filter Mode:</span>
          <span className="font-bold text-neo-fg uppercase">{projectFilterMode}</span>
        </button>

        <div className="text-neo-fg opacity-80">Ln 1, Col 1</div>
      </div>
    </div>
  )
}
