"use client"

import { useEffect, useRef, useState } from "react"

export interface IframeRunnerProps {
  htmlContent: string
  cssContent?: string
  jsContent?: string
  onConsoleMessage?: (message: { type: string; args: any[] }) => void
  liveReload?: boolean
  debounceMs?: number
}

export function IframeRunner({
  htmlContent,
  cssContent = "",
  jsContent = "",
  onConsoleMessage,
  liveReload = true,
  debounceMs = 500,
}: IframeRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  const createIframeContent = () => {
    // Inject console forwarding script
    const consoleScript = `
      <script>
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };

          ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = function(...args) {
              // Call original method
              originalConsole[method].apply(console, args);
              
              // Forward to parent
              try {
                window.parent.postMessage({
                  type: 'console',
                  method: method,
                  args: args.map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch {
                      return String(arg);
                    }
                  })
                }, '*');
              } catch (e) {
                // Ignore postMessage errors
              }
            };
          });

          // Catch unhandled errors
          window.addEventListener('error', function(event) {
            console.error('Uncaught Error:', event.error?.message || event.message);
          });

          window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled Promise Rejection:', event.reason);
          });
        })();
      </script>
    `

    // Combine HTML with CSS and JS
    let fullHtml = htmlContent

    // Inject CSS if provided
    if (cssContent.trim()) {
      const cssTag = `<style>${cssContent}</style>`
      if (fullHtml.includes("</head>")) {
        fullHtml = fullHtml.replace("</head>", `${cssTag}</head>`)
      } else {
        fullHtml = `<head>${cssTag}</head>${fullHtml}`
      }
    }

    // Inject console script and JS
    const scriptTags = `${consoleScript}${jsContent.trim() ? `<script>${jsContent}</script>` : ""}`
    if (fullHtml.includes("</body>")) {
      fullHtml = fullHtml.replace("</body>", `${scriptTags}</body>`)
    } else {
      fullHtml = `${fullHtml}${scriptTags}`
    }

    return fullHtml
  }

  const updateIframe = () => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const content = createIframeContent()

    // Create blob URL for the content
    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    iframe.src = url

    // Clean up previous blob URL
    iframe.onload = () => {
      URL.revokeObjectURL(url)
    }
  }

  useEffect(() => {
    if (liveReload) {
      // Debounce updates
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      const timeout = setTimeout(() => {
        updateIframe()
      }, debounceMs)

      setDebounceTimeout(timeout)

      return () => {
        if (timeout) clearTimeout(timeout)
      }
    } else {
      updateIframe()
    }
  }, [htmlContent, cssContent, jsContent, liveReload, debounceMs])

  useEffect(() => {
    // Listen for console messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console" && onConsoleMessage) {
        onConsoleMessage({
          type: event.data.method,
          args: event.data.args,
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onConsoleMessage])

  return <iframe ref={iframeRef} className="w-full h-full border-0" sandbox="allow-scripts" title="Code Preview" />
}
