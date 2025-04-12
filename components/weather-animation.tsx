"use client"

import { useEffect, useRef } from "react"
import { Cloud, CloudRain, Sun, CloudSun, CloudSnow, CloudLightning, CloudFog } from "lucide-react"

interface WeatherAnimationProps {
  condition: string
  size?: "small" | "medium" | "large"
}

export function WeatherAnimation({ condition, size = "medium" }: WeatherAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<HTMLDivElement[]>([])

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

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up any existing particles
    particlesRef.current.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
    particlesRef.current = []

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()

    // Create particles based on weather condition
    if (condition.toLowerCase().includes("rain")) {
      // Create raindrops
      for (let i = 0; i < 20; i++) {
        const raindrop = document.createElement("div")
        raindrop.className = "absolute bg-blue-400 rounded-full opacity-70"
        raindrop.style.width = "2px"
        raindrop.style.height = "10px"
        raindrop.style.left = `${Math.random() * width}px`
        raindrop.style.top = `${Math.random() * height}px`
        raindrop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`
        container.appendChild(raindrop)
        particlesRef.current.push(raindrop)
      }

      // Animate raindrops
      const animateRain = () => {
        particlesRef.current.forEach((raindrop) => {
          const top = Number.parseFloat(raindrop.style.top)
          if (top > height) {
            raindrop.style.top = "0px"
          } else {
            raindrop.style.top = `${top + 2}px`
          }
        })
        animationRef.current = requestAnimationFrame(animateRain)
      }
      animateRain()
    } else if (condition.toLowerCase().includes("snow")) {
      // Create snowflakes
      for (let i = 0; i < 15; i++) {
        const snowflake = document.createElement("div")
        snowflake.className = "absolute bg-white rounded-full opacity-80"
        const size = 2 + Math.random() * 3
        snowflake.style.width = `${size}px`
        snowflake.style.height = `${size}px`
        snowflake.style.left = `${Math.random() * width}px`
        snowflake.style.top = `${Math.random() * height}px`
        container.appendChild(snowflake)
        particlesRef.current.push(snowflake)
      }

      // Animate snowflakes
      const animateSnow = () => {
        particlesRef.current.forEach((snowflake) => {
          const top = Number.parseFloat(snowflake.style.top)
          const left = Number.parseFloat(snowflake.style.left)
          if (top > height) {
            snowflake.style.top = "0px"
          } else {
            snowflake.style.top = `${top + 0.5}px`
            snowflake.style.left = `${left + (Math.random() - 0.5)}px`
          }
        })
        animationRef.current = requestAnimationFrame(animateSnow)
      }
      animateSnow()
    } else if (condition.toLowerCase().includes("sunny")) {
      // Create sun rays
      for (let i = 0; i < 8; i++) {
        const ray = document.createElement("div")
        ray.className = "absolute bg-yellow-300 opacity-70"
        ray.style.width = "2px"
        ray.style.height = "10px"
        ray.style.transformOrigin = "center bottom"
        ray.style.left = `${width / 2}px`
        ray.style.top = `${height / 2}px`
        ray.style.transform = `rotate(${i * 45}deg) translateY(-${width / 2}px)`
        container.appendChild(ray)
        particlesRef.current.push(ray)
      }

      // Animate sun rays
      let angle = 0
      const animateSun = () => {
        angle += 0.5
        container.style.transform = `rotate(${angle}deg)`
        animationRef.current = requestAnimationFrame(animateSun)
      }
      animateSun()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      })
    }
  }, [condition])

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
