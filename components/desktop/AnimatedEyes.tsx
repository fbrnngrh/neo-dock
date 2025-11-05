"use client"

import { useState, useEffect, useRef } from "react"

interface EyePosition {
  x: number
  y: number
}

export function AnimatedEyes() {
  const [leftPupil, setLeftPupil] = useState<EyePosition>({ x: 0, y: 0 })
  const [rightPupil, setRightPupil] = useState<EyePosition>({ x: 0, y: 0 })
  const leftEyeRef = useRef<HTMLDivElement>(null)
  const rightEyeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Left eye tracking
      if (leftEyeRef.current) {
        const leftEyeRect = leftEyeRef.current.getBoundingClientRect()
        const leftEyeCenterX = leftEyeRect.left + leftEyeRect.width / 2
        const leftEyeCenterY = leftEyeRect.top + leftEyeRect.height / 2

        const leftAngle = Math.atan2(e.clientY - leftEyeCenterY, e.clientX - leftEyeCenterX)
        const leftDistance = Math.min(12, Math.hypot(e.clientX - leftEyeCenterX, e.clientY - leftEyeCenterY) / 30)

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
        const rightDistance = Math.min(12, Math.hypot(e.clientX - rightEyeCenterX, e.clientY - rightEyeCenterY) / 30)

        setRightPupil({
          x: Math.cos(rightAngle) * rightDistance,
          y: Math.sin(rightAngle) * rightDistance,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed bottom-24 right-8 z-40 flex gap-6 pointer-events-none select-none">
      {/* Left Eye */}
      <div
        ref={leftEyeRef}
        className="relative w-20 h-20 bg-white rounded-full border-4 border-foreground shadow-lg flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #ffffff, #f3f4f6)",
        }}
      >
        {/* Eye shine/reflection */}
        <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-full opacity-40 blur-sm" />

        {/* Iris */}
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
            background: "radial-gradient(circle at 40% 40%, #60a5fa, #3b82f6, #1e40af)",
          }}
        >
          {/* Pupil */}
          <div className="w-6 h-6 bg-black rounded-full">
            {/* Pupil shine */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60" />
          </div>
        </div>
      </div>

      {/* Right Eye */}
      <div
        ref={rightEyeRef}
        className="relative w-20 h-20 bg-white rounded-full border-4 border-foreground shadow-lg flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #ffffff, #f3f4f6)",
        }}
      >
        {/* Eye shine/reflection */}
        <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-full opacity-40 blur-sm" />

        {/* Iris */}
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
            background: "radial-gradient(circle at 40% 40%, #60a5fa, #3b82f6, #1e40af)",
          }}
        >
          {/* Pupil */}
          <div className="w-6 h-6 bg-black rounded-full">
            {/* Pupil shine */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60" />
          </div>
        </div>
      </div>
    </div>
  )
}
