"use client"

import Link from "next/link"
import { Cloud, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UnitToggle } from "@/components/unit-toggle"
import { SavedLocations } from "@/components/saved-locations"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Cloud className="h-6 w-6 text-sky-500" />
          <span className="text-xl font-bold">Ob-havo Ilovasi</span>
        </Link>

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 flex flex-col gap-4">
                <Link href="/" onClick={toggleMenu}>
                  Asosiy
                </Link>
                <Link href="/forecast" onClick={toggleMenu}>
                  Prognoz
                </Link>
                <Link href="/about" onClick={toggleMenu}>
                  Biz haqimizda
                </Link>
                <div className="flex flex-wrap gap-2">
                  <UnitToggle />
                  <SavedLocations />
                  <ThemeToggle />
                </div>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Asosiy
            </Link>
            <Link href="/forecast" className="text-sm font-medium hover:text-primary">
              Prognoz
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              Biz haqimizda
            </Link>
            <div className="flex items-center gap-2 ml-2">
              <ThemeToggle />
              <UnitToggle />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
