export interface RunnerResult {
  success: boolean
  output: string[]
  error?: string
  duration?: number
}

export interface RunnerOptions {
  timeout?: number
  mode: "worker" | "iframe"
}

export interface ConsoleMessage {
  type: "log" | "error" | "warn" | "info"
  args: any[]
  timestamp: number
}

export interface RunnerState {
  isRunning: boolean
  currentWorker?: Worker
  currentIframe?: HTMLIFrameElement
  startTime?: number
}
