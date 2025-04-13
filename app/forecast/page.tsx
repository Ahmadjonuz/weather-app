"use client"
import { Search } from "@/components/search"
import { WeatherDisplay } from "@/components/weather-display"
import { useSearchParams } from "next/navigation"

export default function ForecastPage() {
  const searchParams = useSearchParams()

  // Get parameters with better fallbacks
  const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : undefined
  const lon = searchParams.get("lon") ? Number.parseFloat(searchParams.get("lon")!) : undefined
  const location = searchParams.get("location") || undefined

  // Check if we have valid parameters
  const hasValidParams = lat !== undefined && !isNaN(lat) && lon !== undefined && !isNaN(lon)

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Weather Forecast</h1>
          <p className="text-muted-foreground">
            {hasValidParams ? 
              (location ? `Weather for ${location}` : "Weather for selected location") 
              : "Weather for your current location"
            }
          </p>
        </div>

        <Search />

        {/* Only pass coordinates if they're valid */}
        <WeatherDisplay
          latitude={hasValidParams ? lat : undefined}
          longitude={hasValidParams ? lon : undefined}
          locationName={location}
        />
      </div>
    </main>
  )
}
