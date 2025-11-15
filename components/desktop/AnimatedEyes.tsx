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
    setTimeout(() => setIsBlinking(false), 150) // Faster blink for neobrutalism
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
        const leftDistance = Math.min(22, Math.hypot(e.clientX - leftEyeCenterX, e.clientY - leftEyeCenterY) / 25)

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
        const rightDistance = Math.min(22, Math.hypot(e.clientX - rightEyeCenterX, e.clientY - rightEyeCenterY) / 25)

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
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-16 pointer-events-none select-none">
      {/* Left Eye */}
      <div className="relative">
        {/* Eye container - Neobrutalism style */}
        <div
          ref={leftEyeRef}
          className="relative w-36 h-36 bg-white border-[6px] border-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden transition-all duration-100"
          style={{
            transform: isBlinking ? "scaleY(0.05)" : "scaleY(1)",
          }}
        >
          {/* White of eye with subtle texture */}
          <div className="absolute inset-0 bg-white" />

          {/* Eye veins/details - subtle */}
          <div className="absolute top-4 right-6 w-12 h-px bg-red-200/30 rotate-45" />
          <div className="absolute bottom-8 left-8 w-10 h-px bg-red-200/20 -rotate-12" />

          {/* Iris - Bold purple neobrutalism */}
          <div
            className="relative w-24 h-24 bg-[#A855F7] border-[5px] border-black rounded-full flex items-center justify-center transition-transform duration-100 ease-out shadow-[inset_0px_4px_8px_rgba(0,0,0,0.3)]"
            style={{
              transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
            }}
          >
            {/* Iris pattern - geometric */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Radiating lines */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-px h-8 bg-black/10"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    transformOrigin: "center",
                  }}
                />
              ))}
              {/* Inner ring */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-black/20 rounded-full" />
            </div>

            {/* Pupil - Bold black */}
            <div className="w-12 h-12 bg-black border-[4px] border-black rounded-full relative overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.5)]">
              {/* Pupil shine - sharp geometric */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-sm rotate-45" />
              <div className="absolute top-1 right-2 w-2 h-2 bg-white/60 rounded-sm" />
            </div>
          </div>

          {/* Eye shine/gloss - geometric */}
          <div className="absolute top-6 left-8 w-10 h-10 bg-white/80 rounded-lg rotate-45 blur-sm" />
          <div className="absolute top-4 left-6 w-6 h-6 bg-white rounded-md" />
        </div>

        {/* Eyelid when blinking - Bold black bar */}
        {isBlinking && (
          <div className="absolute inset-0 bg-black rounded-full border-[6px] border-black" />
        )}

        {/* Bottom shadow for depth */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-md" />
      </div>

      {/* Right Eye */}
      <div className="relative">
        {/* Eye container - Neobrutalism style */}
        <div
          ref={rightEyeRef}
          className="relative w-36 h-36 bg-white border-[6px] border-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden transition-all duration-100"
          style={{
            transform: isBlinking ? "scaleY(0.05)" : "scaleY(1)",
          }}
        >
          {/* White of eye with subtle texture */}
          <div className="absolute inset-0 bg-white" />

          {/* Eye veins/details - subtle */}
          <div className="absolute top-4 left-6 w-12 h-px bg-red-200/30 -rotate-45" />
          <div className="absolute bottom-8 right-8 w-10 h-px bg-red-200/20 rotate-12" />

          {/* Iris - Bold purple neobrutalism */}
          <div
            className="relative w-24 h-24 bg-[#A855F7] border-[5px] border-black rounded-full flex items-center justify-center transition-transform duration-100 ease-out shadow-[inset_0px_4px_8px_rgba(0,0,0,0.3)]"
            style={{
              transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
            }}
          >
            {/* Iris pattern - geometric */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Radiating lines */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-px h-8 bg-black/10"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    transformOrigin: "center",
                  }}
                />
              ))}
              {/* Inner ring */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-black/20 rounded-full" />
            </div>

            {/* Pupil - Bold black */}
            <div className="w-12 h-12 bg-black border-[4px] border-black rounded-full relative overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.5)]">
              {/* Pupil shine - sharp geometric */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-sm rotate-45" />
              <div className="absolute top-1 right-2 w-2 h-2 bg-white/60 rounded-sm" />
            </div>
          </div>

          {/* Eye shine/gloss - geometric */}
          <div className="absolute top-6 left-8 w-10 h-10 bg-white/80 rounded-lg rotate-45 blur-sm" />
          <div className="absolute top-4 left-6 w-6 h-6 bg-white rounded-md" />
        </div>

        {/* Eyelid when blinking - Bold black bar */}
        {isBlinking && (
          <div className="absolute inset-0 bg-black rounded-full border-[6px] border-black" />
        )}

        {/* Bottom shadow for depth */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-md" />
      </div>

      {/* "NEO-DOCK" label below eyes */}
      <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <div className="bg-white border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="font-black text-2xl text-black tracking-tight">NEO-DOCK</span>
        </div>
      </div>
    </div>
  )
}
