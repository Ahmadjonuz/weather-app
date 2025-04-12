"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, CloudRain, Wind, Droplets, Loader2, RefreshCw } from "lucide-react"
import { WeatherForecast } from "@/components/weather-forecast"
import { HourlyForecast } from "@/components/hourly-forecast"
import { useToast } from "@/hooks/use-toast"
import { fetchWeatherData } from "@/lib/api"
import { getCurrentLocation, getLocationName, getDefaultLocation } from "@/lib/location"
import { useApp } from "@/contexts/app-context"
import { WeatherAnimation } from "@/components/weather-animation"
import type { WeatherData } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface WeatherDisplayProps {
  latitude?: number
  longitude?: number
  locationName?: string
}

export function WeatherDisplay({ latitude, longitude, locationName }: WeatherDisplayProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { formatTemperature, formatWindSpeed, addSavedLocation } = useApp()

  const loadWeatherData = useCallback(async () => {
    try {
      if (isRefreshing) {
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }
      setError(null)

      let lat: number, lon: number, name: string

      // Use provided coordinates or get user's location
      if (latitude !== undefined && longitude !== undefined) {
        lat = latitude
        lon = longitude
        // Always try to get a proper location name
        name = locationName || await getLocationName(lat, lon)
        
        // If we still have coordinates in the name, try harder to get a proper name
        if (name && name.includes('°')) {
          console.log("Location name contains coordinates, trying to get a better name");
          try {
            const betterName = await getLocationName(lat, lon);
            if (betterName && !betterName.includes('°')) {
              name = betterName;
            }
          } catch (error) {
            console.warn("Failed to get better location name:", error);
          }
        }
      } else {
        try {
          // Try to get user's current location
          const position = await getCurrentLocation()
          lat = position.latitude
          lon = position.longitude

          // Get location name with better handling
          name = await getLocationName(lat, lon)
          console.log(`Resolved current location to: ${name}`);
          
          // Check if we're using the default location for New York
          const defaultLocation = getDefaultLocation()
          const isDefaultLocation =
            Math.abs(lat - defaultLocation.latitude) < 0.01 && Math.abs(lon - defaultLocation.longitude) < 0.01
          
          if (isDefaultLocation) {
            toast({
              title: "Using default location",
              description: "We couldn't access your location, showing weather for New York instead.",
              duration: 5000,
            })
          }
        } catch (locError) {
          console.error("Location error:", locError)
          // Fallback to default location if there's any error
          const defaultLoc = getDefaultLocation()
          lat = defaultLoc.latitude
          lon = defaultLoc.longitude
          name = await getLocationName(lat, lon) // Get proper name instead of hardcoding

          toast({
            title: "Using default location",
            description: "We couldn't access your location, showing weather for our default city instead.",
            duration: 5000,
          })
        }
      }

      try {
        // Fetch weather data
        const weatherData = await fetchWeatherData(lat, lon, name)
        setCurrentWeather(weatherData)
        setLastUpdated(new Date())
      } catch (weatherError) {
        console.error("Weather API error:", weatherError)
        setError("Unable to load weather data. Please try again later.")
        toast({
          title: "Error loading weather",
          description: "Unable to load weather data. Please try again later or search for a different location.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in weather display:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [latitude, longitude, locationName, toast, isRefreshing])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadWeatherData()
  }

  useEffect(() => {
    loadWeatherData()
  }, [loadWeatherData])

  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error || !currentWeather) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{error || "Ob-havo ma'lumotlari mavjud emas. Iltimos, manzilni qidiring."}</p>
        <p className="text-sm text-muted-foreground">Yuqoridagi qidiruv maydonidan aniq shaharni qidirib ko'ring.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-700 dark:to-blue-800 text-white p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {currentWeather.location.split(',')[0]}
              </CardTitle>
              <CardDescription className="text-blue-50 text-sm flex flex-col sm:flex-row sm:items-center">
                <span className="mb-1 sm:mb-0">{currentWeather.location.includes(',') ? currentWeather.location.split(',').slice(1).join(',').trim() : ''}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>{new Date().toLocaleDateString().replace(/2024/g, '2025')} • {currentWeather.time}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <WeatherAnimation condition={currentWeather.condition} />
              <div>
                <div className="text-3xl md:text-4xl font-bold">{formatTemperature(currentWeather.temperature)}</div>
                <div className="text-blue-50 text-xs sm:text-sm">His qilish {formatTemperature(currentWeather.feelsLike)}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Holat</p>
                <p className="font-medium text-sm md:text-base truncate">{currentWeather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Shamol</p>
                <p className="font-medium text-sm md:text-base">{formatWindSpeed(currentWeather.windSpeed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Namlik</p>
                <p className="font-medium text-sm md:text-base">{currentWeather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Yog'ingarchilik</p>
                <p className="font-medium text-sm md:text-base">{currentWeather.precipitation} mm</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500">
          <span>So'nggi yangilash: {formatUpdateTime(lastUpdated)}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only">{isRefreshing ? 'Yangilanmoqda...' : 'Yangilash'}</span>
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="text-sm md:text-base">Kunlik Prognoz</TabsTrigger>
          <TabsTrigger value="hourly" className="text-sm md:text-base">Soatlik Prognoz</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card>
            <CardContent className="p-3 md:p-4">
              <WeatherForecast forecast={currentWeather.forecast} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hourly">
          <Card>
            <CardContent className="p-3 md:p-4">
              <HourlyForecast hourlyData={currentWeather.hourlyForecast} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
