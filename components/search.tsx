"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SearchIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getLocationByName } from "@/lib/location"
import { useRouter } from "next/navigation"
import { getDefaultLocation } from "@/lib/location"

export function Search() {
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Handle hydration mismatch by ensuring the component is only rendered client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location.trim()) {
      toast({
        title: "Manzil kiritish zarur",
        description: "Ob-havo ma'lumotlarini qidirish uchun manzilni kiriting.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get coordinates for the location
      const { latitude, longitude } = await getLocationByName(location)

      // Check if we got the default location
      const defaultLocation = getDefaultLocation()
      const isDefaultLocation =
        Math.abs(latitude - defaultLocation.latitude) < 0.01 && Math.abs(longitude - defaultLocation.longitude) < 0.01

      if (isDefaultLocation) {
        toast({
          title: "Manzil topilmadi",
          description: `"${location}" topilmadi. Uning o'rniga standart manzil ko'rsatilmoqda.`,
          variant: "destructive",
        })
        // Still redirect, but use "New York (Default)" as the name
        router.push(`/forecast?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent("Nyu-York (Standart)")}`)
      } else {
        // Redirect to the forecast page with coordinates
        router.push(`/forecast?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent(location)}`)
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Manzilni topishda xatolik",
        description: "Manzilni topib bo'lmadi. Boshqa qidiruv so'zini sinab ko'ring.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Return a placeholder during server rendering or before hydration completes
  if (!mounted) {
    return (
      <div id="search" className="w-full max-w-xl mx-auto my-4 md:my-8 px-2 md:px-0">
        <div className="flex w-full items-center space-x-2">
          <div className="relative flex-1">
            <div className="h-10 md:h-12 rounded-md border border-input"></div>
          </div>
          <div className="h-10 md:h-12 rounded-md px-3 md:px-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div id="search" className="w-full max-w-xl mx-auto my-4 md:my-8 px-2 md:px-0">
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Shaharni qidirish..."
            className="pl-9 h-10 md:h-12 text-sm md:text-base"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 bg-blue-500 hover:bg-blue-600">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="sr-only sm:not-sr-only">Qidirilmoqda...</span>
            </>
          ) : (
            "Qidirish"
          )}
        </Button>
      </form>
    </div>
  )
}
