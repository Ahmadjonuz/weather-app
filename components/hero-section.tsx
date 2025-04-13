"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Compass, Waves, CloudSun } from "lucide-react"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"
import { Search } from "@/components/search"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [windowHeight, setWindowHeight] = useState<number | null>(null)

  useEffect(() => {
    // Only run on client
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section
      className="relative w-full bg-blue-900 overflow-hidden flex flex-col items-center justify-center"
      style={{ minHeight: "100svh" }}
    >
      {/* Background with reduced opacity for mobile */}
      <div className="absolute inset-0 w-full h-full opacity-40">
        <BackgroundBeamsWithCollision className="w-full h-full">
          <div aria-hidden="true"></div>
        </BackgroundBeamsWithCollision>
      </div>

      {/* Dark overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-blue-900/70 to-blue-950/80 w-full h-full" 
        aria-hidden="true"
      />

      <div className="container relative flex flex-col items-center justify-between px-4 md:px-6 z-10 py-8 md:py-12">
        {/* Logo area */}
        <div className="w-full flex justify-center mb-6 md:mb-8">
          <div className="flex items-center justify-center bg-blue-800/30 backdrop-blur-sm p-2 md:p-3 rounded-full border border-blue-400/20">
            <CloudSun className="h-8 w-8 md:h-10 md:w-10 text-blue-100" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-6 md:mb-10">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tighter mb-4 md:mb-6 text-white">
            Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Weather</span>, Beautifully Delivered
          </h1>
          
          <p className="text-sm md:text-lg text-blue-100 max-w-xl mb-6">
            Accurate forecasts, beautiful visualizations, and detailed weather information for any place in the world - all in a beautifully designed app.
          </p>

          {/* Location access notice */}
          <Alert className="bg-blue-800/40 border border-blue-500/20 backdrop-blur-sm text-blue-50 mb-4 mx-auto max-w-md">
            <MapPin className="h-4 w-4 text-blue-300" />
            <AlertDescription className="text-xs md:text-sm">
              Allow location access for the best experience and accurate local forecasts
            </AlertDescription>
          </Alert>

          {/* Search component */}
          <div className="w-full max-w-md mx-auto">
            <Search />
          </div>
        </div>

        {/* Stats section - mobile optimized with smaller text and tighter spacing */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
          <div className="flex flex-col items-center bg-blue-800/20 backdrop-blur-sm border border-blue-400/10 rounded-lg p-3 md:p-4">
            <Cloud className="h-5 w-5 md:h-6 md:w-6 mb-2 text-blue-300" />
            <h3 className="text-base md:text-lg font-medium text-white">Global Coverage</h3>
            <p className="text-xs md:text-sm text-blue-200">200,000+ locations worldwide</p>
          </div>
          <div className="flex flex-col items-center bg-blue-800/20 backdrop-blur-sm border border-blue-400/10 rounded-lg p-3 md:p-4">
            <CloudRain className="h-5 w-5 md:h-6 md:w-6 mb-2 text-blue-300" />
            <h3 className="text-base md:text-lg font-medium text-white">Frequent Updates</h3>
            <p className="text-xs md:text-sm text-blue-200">Data updated every 10 minutes</p>
          </div>
          <div className="flex flex-col items-center bg-blue-800/20 backdrop-blur-sm border border-blue-400/10 rounded-lg p-3 md:p-4">
            <Compass className="h-5 w-5 md:h-6 md:w-6 mb-2 text-blue-300" />
            <h3 className="text-base md:text-lg font-medium text-white">5-Day Forecast</h3>
            <p className="text-xs md:text-sm text-blue-200">Detailed daily and hourly predictions</p>
          </div>
          <div className="flex flex-col items-center bg-blue-800/20 backdrop-blur-sm border border-blue-400/10 rounded-lg p-3 md:p-4">
            <Waves className="h-5 w-5 md:h-6 md:w-6 mb-2 text-blue-300" />
            <h3 className="text-base md:text-lg font-medium text-white">Multiple Sources</h3>
            <p className="text-xs md:text-sm text-blue-200">Data from leading weather services</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-xs text-blue-200 mb-1">Scroll Down</span>
          <div className="h-5 w-1 border-l border-r border-blue-300"></div>
        </div>
      </div>
    </section>
  )
}
