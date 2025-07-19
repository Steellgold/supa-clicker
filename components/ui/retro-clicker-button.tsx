"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { Component } from "@/type/component"
import { cn } from "@/lib/utils"

type RetroClickerButtonProps = {
  onClick: () => {
    gained: number;
    isGolden?: boolean
    isPlatinum?: boolean
  }
  disabled?: boolean
}

type ClickEffect = {
  id: number
  x: number
  y: number
  gained: number
  isGolden?: boolean
  isPlatinum?: boolean
}

export const RetroClickerButton: Component<RetroClickerButtonProps> = ({ onClick, disabled = false }) => {
  const [isClicking, setIsClicking] = useState(false)
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return

      setIsClicking(true)

      const result = onClick()

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      const effectId = Date.now()

      setClickEffects((prev) => [
        ...prev,
        {
          id: effectId, x, y,
          gained: result.gained,
          isGolden: result.isGolden,
          isPlatinum: result.isPlatinum,
        },
      ])

      setTimeout(() => {
        setClickEffects((prev) => prev.filter((effect) => effect.id !== effectId))
      }, 1000)

      setTimeout(() => setIsClicking(false), 200)
    },
    [onClick, disabled],
  )

  return (
    <div className="relative flex items-center justify-center">
      <motion.button
        onClick={handleClick}
        disabled={disabled || isClicking}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isClicking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.1 }}
        className={cn(
          "w-48 h-48 rounded-full border-4 relative overflow-hidden transition-all duration-150",
          "bg-gray-900 dark:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500", {
            "border-green-500 shadow-lg shadow-green-500/50": isClicking,
            "border-gray-800 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300": !isClicking,
          }
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-16 h-16 text-green-500 dark:text-green-400" fill="currentColor" />
        </div>
      </motion.button>

      {clickEffects.map((effect) => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, scale: 0, x: effect.x, y: effect.y }}
          animate={{ opacity: 0, scale: 1.5, y: effect.y - 40 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "absolute pointer-events-none text-lg font-bold z-20", {
              "text-yellow-400": effect.isGolden,
              "text-purple-500": effect.isPlatinum,
              "text-green-500": !effect.isGolden && !effect.isPlatinum,
            }
          )}
          style={{ left: "50%", top: "50%" }}
        >
          +{effect.gained}
        </motion.div>
      ))}
    </div>
  )
}
