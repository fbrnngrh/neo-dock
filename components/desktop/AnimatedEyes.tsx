"use client"

import { useState, useEffect, useRef } from "react"

interface EyePosition {
  x: number
  y: number
}

export function AnimatedEyes() {
  const [leftPupil, setLeftPupil] = useState<EyePosition>({ x: 0, y: 0 })
  const [rightPupil, setRightPupil] = useState<EyePosition>({ x: 0, y: 0 })
  const [isBlinking, setIsBlinking] = useState(false)
  const leftEyeRef = useRef<HTMLDivElement>(null)
  const rightEyeRef = useRef<HTMLDivElement>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Blink animation
  const triggerBlink = () => {
    setIsBlinking(true)
    setTimeout(() => setIsBlinking(false), 200) // Blink duration 200ms
  }

  // Start auto-blinking when idle
  const startAutoBlinking = () => {
    if (blinkIntervalRef.current) return

    blinkIntervalRef.current = setInterval(() => {
      triggerBlink()
    }, 3000 + Math.random() * 2000) // Blink every 3-5 seconds
  }

  // Stop auto-blinking
  const stopAutoBlinking = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current)
      blinkIntervalRef.current = null
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Reset idle timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
      stopAutoBlinking()

      // Set new idle timer (3 seconds)
      idleTimerRef.current = setTimeout(() => {
        startAutoBlinking()
      }, 3000)

      // Left eye tracking
      if (leftEyeRef.current) {
        const leftEyeRect = leftEyeRef.current.getBoundingClientRect()
        const leftEyeCenterX = leftEyeRect.left + leftEyeRect.width / 2
        const leftEyeCenterY = leftEyeRect.top + leftEyeRect.height / 2

        const leftAngle = Math.atan2(e.clientY - leftEyeCenterY, e.clientX - leftEyeCenterX)
        const leftDistance = Math.min(20, Math.hypot(e.clientX - leftEyeCenterX, e.clientY - leftEyeCenterY) / 25)

        setLeftPupil({
          x: Math.cos(leftAngle) * leftDistance,
          y: Math.sin(leftAngle) * leftDistance,
        })
      }

      // Right eye tracking
      if (rightEyeRef.current) {
        const rightEyeRect = rightEyeRef.current.getBoundingClientRect()
        const rightEyeCenterX = rightEyeRect.left + rightEyeRect.width / 2
        const rightEyeCenterY = rightEyeRect.top + rightEyeRect.height / 2

        const rightAngle = Math.atan2(e.clientY - rightEyeCenterY, e.clientX - rightEyeCenterX)
        const rightDistance = Math.min(20, Math.hypot(e.clientX - rightEyeCenterX, e.clientY - rightEyeCenterY) / 25)

        setRightPupil({
          x: Math.cos(rightAngle) * rightDistance,
          y: Math.sin(rightAngle) * rightDistance,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Start auto-blinking after initial 3 seconds
    idleTimerRef.current = setTimeout(() => {
      startAutoBlinking()
    }, 3000)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      stopAutoBlinking()
    }
  }, [])

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-12 pointer-events-none select-none">
      {/* Left Eye */}
      <div className="relative">
        <div
          ref={leftEyeRef}
          className="relative w-32 h-32 bg-white rounded-full border-4 border-foreground shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{
            background: "linear-gradient(145deg, #ffffff, #f9fafb)",
            transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)",
          }}
        >
          {/* Eye shine/reflection */}
          <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full opacity-50 blur-sm" />

          {/* Iris */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
              background: "radial-gradient(circle at 35% 35%, #c084fc, #a855f7, #9333ea, #7e22ce)",
            }}
          >
            {/* Inner iris detail */}
            <div className="absolute inset-0 rounded-full" style={{
              background: "radial-gradient(circle at 40% 40%, transparent 30%, rgba(0,0,0,0.1) 60%)"
            }} />

            {/* Pupil */}
            <div className="w-10 h-10 bg-black rounded-full relative">
              {/* Pupil shine */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full opacity-70" />
            </div>
          </div>
        </div>

        {/* Eyelid shadow when blinking */}
        {isBlinking && (
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-transparent rounded-full" />
        )}
      </div>

      {/* Right Eye */}
      <div className="relative">
        <div
          ref={rightEyeRef}
          className="relative w-32 h-32 bg-white rounded-full border-4 border-foreground shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{
            background: "linear-gradient(145deg, #ffffff, #f9fafb)",
            transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)",
          }}
        >
          {/* Eye shine/reflection */}
          <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full opacity-50 blur-sm" />

          {/* Iris */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
              background: "radial-gradient(circle at 35% 35%, #c084fc, #a855f7, #9333ea, #7e22ce)",
            }}
          >
            {/* Inner iris detail */}
            <div className="absolute inset-0 rounded-full" style={{
              background: "radial-gradient(circle at 40% 40%, transparent 30%, rgba(0,0,0,0.1) 60%)"
            }} />

            {/* Pupil */}
            <div className="w-10 h-10 bg-black rounded-full relative">
              {/* Pupil shine */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full opacity-70" />
            </div>
          </div>
        </div>

        {/* Eyelid shadow when blinking */}
        {isBlinking && (
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-transparent rounded-full" />
        )}
      </div>
    </div>
  )
}
