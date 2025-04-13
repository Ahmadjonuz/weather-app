"use client"

import React, { useEffect, useState } from "react"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import Link from "next/link"
import { CloudSun, MapPin, RefreshCw, Calendar, Database, ChevronDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search } from "@/components/search"
import { Globe2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const [height, setHeight] = useState('100vh');
  const router = useRouter();

  useEffect(() => {
    const updateHeight = () => {
      setHeight(`${window.innerHeight}px`);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <section 
      className="w-full h-full relative flex flex-col items-center justify-center text-center px-4 md:px-6 pb-16 md:pb-24"
      style={{ minHeight: height }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <BackgroundBeamsWithCollision className="w-full h-full opacity-70 dark:opacity-80 md:pb-36">
          <div aria-hidden="true"></div>
        </BackgroundBeamsWithCollision>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-10 flex justify-center">
          <div className="p-4 rounded-full bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm">
            <CloudSun size={72} className="text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Haqiqiy vaqtdagi <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Ob-havo</span> ma'lumotlari
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Butun dunyo bo'ylab aniq va tezkor ob-havo ma'lumotlari va bashoratlarini oling
        </p>
        
        <div className="mt-8 max-w-xl mx-auto">
            <Search className="shadow-lg" />
        </div>
        
        
      </div>
    </section>
  );
}
