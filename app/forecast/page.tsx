"use client"
import { Search } from "@/components/search"
import { WeatherDisplay } from "@/components/weather-display"
import { useSearchParams } from "next/navigation"

export default function ForecastPage() {
  const searchParams = useSearchParams()

  // Get parameters with better fallbacks
  const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : undefined
  const lon = searchParams.get("lon") ? Number.parseFloat(searchParams.get("lon")!) : undefined
  const notFound = searchParams.get("notFound") === "true"

  // Check if we have valid parameters
  const hasValidParams = lat !== undefined && !isNaN(lat) && lon !== undefined && !isNaN(lon)

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Ob-havo Ma'lumoti</h1>
          <p className="text-muted-foreground">
            {notFound ? 
              "Joylashuv topilmadi. Standart ob-havo ma'lumotlarini ko'rsatmoqdamiz." : 
              hasValidParams ? 
                "Tanlangan joylashuv uchun ob-havo" : 
                "Hozirgi joylashuvingiz uchun ob-havo"
            }
          </p>
        </div>

        <Search />

        {/* Only pass coordinates if they're valid */}
        <WeatherDisplay
          latitude={hasValidParams ? lat : undefined}
          longitude={hasValidParams ? lon : undefined}
          locationNotFound={notFound}
        />
      </div>
    </main>
  )
}
