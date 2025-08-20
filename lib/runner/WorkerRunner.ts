export class WorkerRunner {
  private worker: Worker | null = null
  private timeout: number
  private timeoutId: NodeJS.Timeout | null = null

  constructor(timeout = 3000) {
    this.timeout = timeout
  }

  async run(code: string, language: "js" | "ts" = "js"): Promise<any> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const output: string[] = []
      let hasResolved = false

      // Transpile TypeScript if needed
      const finalCode = language === "ts" ? this.transpileTS(code) : code

      // Create worker with security restrictions
      const workerCode = `
        // Override console methods to capture output
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info
        };

        console.log = (...args) => {
          self.postMessage({ type: 'console', method: 'log', args: args.map(arg => String(arg)) });
        };
        console.error = (...args) => {
          self.postMessage({ type: 'console', method: 'error', args: args.map(arg => String(arg)) });
        };
        console.warn = (...args) => {
          self.postMessage({ type: 'console', method: 'warn', args: args.map(arg => String(arg)) });
        };
        console.info = (...args) => {
          self.postMessage({ type: 'console', method: 'info', args: args.map(arg => String(arg)) });
        };

        // Block network access
        if (typeof fetch !== 'undefined') {
          fetch = () => { throw new Error('Network access is blocked in playground'); };
        }
        if (typeof WebSocket !== 'undefined') {
          WebSocket = class { constructor() { throw new Error('WebSocket access is blocked in playground'); } };
        }
        if (typeof importScripts !== 'undefined') {
          importScripts = () => { throw new Error('importScripts is blocked in playground'); };
        }

        // Execute user code
        try {
          ${finalCode}
          self.postMessage({ type: 'complete' });
        } catch (error) {
          self.postMessage({ type: 'error', message: error.message, stack: error.stack });
        }
      `

      const blob = new Blob([workerCode], { type: "application/javascript" })
      this.worker = new Worker(URL.createObjectURL(blob))

      // Set timeout
      this.timeoutId = setTimeout(() => {
        if (!hasResolved) {
          this.terminate()
          hasResolved = true
          resolve({
            success: false,
            output,
            error: `Execution timed out after ${this.timeout}ms`,
            duration: Date.now() - startTime,
          })
        }
      }, this.timeout)

      // Handle worker messages
      this.worker.onmessage = (event) => {
        const { type, method, args, message, stack } = event.data

        switch (type) {
          case "console":
            output.push(`[${method}] ${args.join(" ")}`)
            break
          case "error":
            if (!hasResolved) {
              hasResolved = true
              this.cleanup()
              resolve({
                success: false,
                output,
                error: `${message}\n${stack}`,
                duration: Date.now() - startTime,
              })
            }
            break
          case "complete":
            if (!hasResolved) {
              hasResolved = true
              this.cleanup()
              resolve({
                success: true,
                output,
                duration: Date.now() - startTime,
              })
            }
            break
        }
      }

      this.worker.onerror = (error) => {
        if (!hasResolved) {
          hasResolved = true
          this.cleanup()
          resolve({
            success: false,
            output,
            error: error.message,
            duration: Date.now() - startTime,
          })
        }
      }
    })
  }

  private transpileTS(code: string): string {
    // Simple TS to JS transpilation (remove type annotations)
    return code
      .replace(/:\s*\w+(\[\])?/g, "") // Remove type annotations
      .replace(/interface\s+\w+\s*{[^}]*}/g, "") // Remove interfaces
      .replace(/private\s+|public\s+|protected\s+/g, "") // Remove access modifiers
      .replace(/readonly\s+/g, "") // Remove readonly
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.cleanup()
  }

  private cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}
