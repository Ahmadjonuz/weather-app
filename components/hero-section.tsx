"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CloudSun, Cloud, Search } from "lucide-react"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [windowHeight, setWindowHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
    <BackgroundBeamsWithCollision className="absolute inset-0 opacity-100 h-screen">
      <div aria-hidden="true" />
    </BackgroundBeamsWithCollision>
    <section 
      className="relative flex items-center justify-center w-full overflow-hidden"
      style={{ minHeight: '100svh' }}
    >    
      
      {/* Main content */}
      <div className="container relative z-20 w-full px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center w-full">
          {/* Logo/icon with enhanced glow */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 blur-2xl bg-blue-400/30 rounded-full transform scale-150" />
            <div className="relative flex items-center justify-center bg-blue-500/20 p-4 rounded-full backdrop-blur-md border border-blue-300/20">
              <CloudSun className="h-10 w-10 text-blue-100" />
            </div>
          </div>
          
          {/* Main heading with enhanced styling and glow effects */}
          <div className="relative mb-8">
            <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-radial from-blue-500/20 via-blue-500/5 to-transparent blur-2xl" />
            <h1 className="relative text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              Sizning{" "}
              <span className="relative inline-block">
                <span className="absolute inset-0 blur-lg bg-blue-400/30" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200">
                  Ob-havo
                </span>
              </span>
              ,
              <br className="sm:hidden" />{" "}
              <span className="relative inline-block mt-1 sm:mt-0">
                <span className="absolute inset-0 blur-lg bg-blue-400/20" />
                <span className="relative">Go'zal Taqdimda</span>
              </span>
            </h1>
          </div>
          
          {/* Subheading with enhanced contrast */}
          <p className="text-base sm:text-lg md:text-xl text-blue-100 w-full max-w-md mx-auto mb-8 sm:mb-12 relative z-10">
            Dunyoning istalgan nuqtasi uchun aniq prognozlar, real vaqt holati va chiroyli vizualizatsiyani oling.
          </p>
          
        </div>
      </div>
    </section>
  
    </>
  )
}
