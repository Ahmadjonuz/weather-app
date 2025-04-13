"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search as SearchIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentLocation } from "@/lib/location"

// List of major cities with their known coordinates to ensure accurate results
const MAJOR_CITIES: Record<string, { latitude: number; longitude: number }> = {
  "tashkent": { latitude: 41.2995, longitude: 69.2401 },
  "toshkent": { latitude: 41.2995, longitude: 69.2401 }, // Uzbek spelling
  "samarkand": { latitude: 39.6270, longitude: 66.9750 },
  "samarqand": { latitude: 39.6270, longitude: 66.9750 }, // Uzbek spelling
  "bukhara": { latitude: 39.7680, longitude: 64.4219 },
  "buxoro": { latitude: 39.7680, longitude: 64.4219 }, // Uzbek spelling
  "namangan": { latitude: 41.0011, longitude: 71.6725 },
  "andijan": { latitude: 40.7829, longitude: 72.3442 },
  "andijon": { latitude: 40.7829, longitude: 72.3442 }, // Uzbek spelling
  "nukus": { latitude: 42.4628, longitude: 59.6166 },
  "fergana": { latitude: 40.3842, longitude: 71.7789 },
  "farg'ona": { latitude: 40.3842, longitude: 71.7789 }, // Uzbek spelling
  "qarshi": { latitude: 38.8578, longitude: 65.7881 },
  "termez": { latitude: 37.2286, longitude: 67.2783 },
  "termiz": { latitude: 37.2286, longitude: 67.2783 }, // Uzbek spelling
  "gulistan": { latitude: 40.4897, longitude: 68.7898 },
  "jizzakh": { latitude: 40.1216, longitude: 67.8422 },
  "jizzax": { latitude: 40.1216, longitude: 67.8422 }, // Uzbek spelling
  // Add common international cities
  "new york": { latitude: 40.7128, longitude: -74.0060 },
  "london": { latitude: 51.5074, longitude: -0.1278 },
  "paris": { latitude: 48.8566, longitude: 2.3522 },
  "tokyo": { latitude: 35.6762, longitude: 139.6503 },
  "beijing": { latitude: 39.9042, longitude: 116.4074 },
  "dubai": { latitude: 25.2048, longitude: 55.2708 },
  "istanbul": { latitude: 41.0082, longitude: 28.9784 },
  "moscow": { latitude: 55.7558, longitude: 37.6173 },
  "singapore": { latitude: 1.3521, longitude: 103.8198 },
  "sydney": { latitude: -33.8688, longitude: 151.2093 }
};

export function Search() {
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Handle hydration mismatch by ensuring the component is only rendered client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location.trim()) {
      toast.error("Please enter a location", {
        description: "Type a city name to search for weather"
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Check if the location is a known major city (case-insensitive)
      const normalizedInput = location.trim().toLowerCase();
      
      // Check for direct matches in our predefined list
      if (MAJOR_CITIES[normalizedInput]) {
        const { latitude, longitude } = MAJOR_CITIES[normalizedInput];
        console.log(`Using predefined coordinates for ${location}: ${latitude}, ${longitude}`);
        router.push(`/forecast?lat=${latitude}&lon=${longitude}`);
        return;
      }
      
      // Otherwise check for partial matches in major cities
      for (const [cityName, coords] of Object.entries(MAJOR_CITIES)) {
        if (normalizedInput.includes(cityName) || cityName.includes(normalizedInput)) {
          console.log(`Found partial match for ${location} with ${cityName}`);
          router.push(`/forecast?lat=${coords.latitude}&lon=${coords.longitude}`);
          return;
        }
      }
      
      // Use geocoding API with improved parameters for better results
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=5&language=en&format=json`
      )
      
      const data = await res.json()
      
      if (data.results && data.results.length > 0) {
        // Check if any result has a high match score - prefer administrative divisions (capitals, major cities)
        const bestMatch = data.results.find(
          (result: any) => result.admin_level === 4 || result.admin_level === 6 || result.feature_code === "PPLC"
        ) || data.results[0]; // Fall back to first result if no administrative match
        
        const { latitude, longitude } = bestMatch;
        router.push(`/forecast?lat=${latitude}&lon=${longitude}`);
      } else {
        // City not found - show toast and fall back to user's current location
        toast.error("City not found", {
          description: `"${location}" was not found. Showing weather for your current location.`
        })
        
        try {
          // Get user's current location
          const userLocation = await getCurrentLocation();
          console.log("Falling back to user's current location:", userLocation);
          
          // Navigate to forecast with user's coordinates
          router.push(`/forecast?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
        } catch (locationError) {
          console.error("Failed to get user location:", locationError);
          
          // If geolocation fails, navigate to forecast page without params
          // The forecast page will handle the fallback to default location
          router.push(`/forecast`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      
      toast.error("Error occurred", {
        description: "An error occurred during search. Falling back to your location."
      })
      
      // Try to get user's current location as fallback
      try {
        const userLocation = await getCurrentLocation();
        router.push(`/forecast?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
      } catch (locationError) {
        // If even that fails, just go to forecast page which will handle fallback
        router.push(`/forecast`);
      }
    } finally {
      setLoading(false)
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
            placeholder="Enter city or location name..."
            className="pl-9 h-10 md:h-12 text-sm md:text-base"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 bg-blue-500 hover:bg-blue-600"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </div>
  )
}
