"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Unit = "metric" | "imperial"

interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
}

interface AppContextType {
  unit: Unit
  toggleUnit: () => void
  savedLocations: SavedLocation[]
  addSavedLocation: (location: Omit<SavedLocation, "id">) => void
  removeSavedLocation: (id: string) => void
  convertTemperature: (celsius: number) => number
  formatTemperature: (celsius: number) => string
  convertWindSpeed: (kmh: number) => number
  formatWindSpeed: (kmh: number) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<Unit>("metric")
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const storedUnit = localStorage.getItem("weatherUnit")
    if (storedUnit === "metric" || storedUnit === "imperial") {
      setUnit(storedUnit)
    }

    const storedLocations = localStorage.getItem("savedLocations")
    if (storedLocations) {
      try {
        setSavedLocations(JSON.parse(storedLocations))
      } catch (e) {
        console.error("Failed to parse saved locations", e)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("weatherUnit", unit)
  }, [unit])

  useEffect(() => {
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations))
  }, [savedLocations])

  // Toggle between metric and imperial units
  const toggleUnit = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"))
  }

  // Add a new saved location
  const addSavedLocation = (location: Omit<SavedLocation, "id">) => {
    // Check if location already exists
    const exists = savedLocations.some(
      (loc) => Math.abs(loc.latitude - location.latitude) < 0.01 && Math.abs(loc.longitude - location.longitude) < 0.01,
    )

    if (!exists) {
      const newLocation = {
        ...location,
        id: Date.now().toString(),
      }
      setSavedLocations((prev) => [...prev, newLocation])
    }
  }

  // Remove a saved location
  const removeSavedLocation = (id: string) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== id))
  }

  // Convert temperature from Celsius to the current unit
  const convertTemperature = (celsius: number): number => {
    if (unit === "imperial") {
      return Math.round((celsius * 9) / 5 + 32)
    }
    return Math.round(celsius)
  }

  // Format temperature with the correct unit symbol
  const formatTemperature = (celsius: number): string => {
    return `${convertTemperature(celsius)}°${unit === "metric" ? "C" : "F"}`
  }

  // Convert wind speed from km/h to the current unit
  const convertWindSpeed = (kmh: number): number => {
    if (unit === "imperial") {
      return Math.round(kmh * 0.621371)
    }
    return Math.round(kmh)
  }

  // Format wind speed with the correct unit
  const formatWindSpeed = (kmh: number): string => {
    return `${convertWindSpeed(kmh)} ${unit === "metric" ? "km/h" : "mph"}`
  }

  return (
    <AppContext.Provider
      value={{
        unit,
        toggleUnit,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        convertTemperature,
        formatTemperature,
        convertWindSpeed,
        formatWindSpeed,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
