"use client"

import { useEffect, useRef } from "react"
import { Cloud, CloudRain, Sun, CloudSun, CloudSnow, CloudLightning, CloudFog } from "lucide-react"

interface WeatherAnimationProps {
  condition: string
  size?: "small" | "medium" | "large"
}

export function FixedWeatherAnimation({ condition, size = "medium" }: WeatherAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sizeMap = {
    small: {
      iconSize: 24,
      containerSize: "h-8 w-8",
    },
    medium: {
      iconSize: 40,
      containerSize: "h-16 w-16",
    },
    large: {
      iconSize: 64,
      containerSize: "h-24 w-24",
    },
  }

  const renderWeatherIcon = () => {
    const { iconSize } = sizeMap[size]

    if (condition.toLowerCase().includes("rain")) {
      return <CloudRain size={iconSize} className="text-blue-600 dark:text-blue-400" />
    } else if (condition.toLowerCase().includes("snow")) {
      return <CloudSnow size={iconSize} className="text-cyan-600 dark:text-cyan-300" />
    } else if (condition.toLowerCase().includes("thunder") || condition.toLowerCase().includes("lightning")) {
      return <CloudLightning size={iconSize} className="text-amber-600 dark:text-amber-400" />
    } else if (condition.toLowerCase().includes("fog") || condition.toLowerCase().includes("mist")) {
      return <CloudFog size={iconSize} className="text-gray-600 dark:text-gray-300" />
    } else if (condition.toLowerCase().includes("partly")) {
      return <CloudSun size={iconSize} className="text-amber-600 dark:text-amber-300" />
    } else if (condition.toLowerCase().includes("cloud")) {
      return <Cloud size={iconSize} className="text-gray-600 dark:text-gray-300" />
    } else if (condition.toLowerCase().includes("sunny") || condition.toLowerCase().includes("clear")) {
      return <Sun size={iconSize} className="text-amber-600 dark:text-yellow-300" />
    } else {
      return <Cloud size={iconSize} className="text-gray-600 dark:text-gray-300" />
    }
  }

  return (
    <div
      className={`relative ${sizeMap[size].containerSize} flex items-center justify-center overflow-hidden`}
      ref={containerRef}
    >
      {renderWeatherIcon()}
    </div>
  )
} 