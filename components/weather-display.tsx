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
import { useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()

  const loadWeatherData = useCallback(async () => {
    try {
      if (isRefreshing) {
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }
      setError(null)

      let lat: number, lon: number, name: string
      let cityNotFound = false; // Track if the requested city was not found
      let usingDefaultLocation = false; // Track if we're using New York as fallback

      // Case 1: Specific coordinates were provided (from a search)
      if (latitude !== undefined && longitude !== undefined) {
        lat = latitude
        lon = longitude
        // Always try to get a proper location name
        name = locationName || await getLocationName(lat, lon)
        
        // Check if using default New York coordinates and the name indicates it's a default/fallback
        const defaultLoc = getDefaultLocation();
        cityNotFound = 
          Math.abs(lat - defaultLoc.latitude) < 0.01 && 
          Math.abs(lon - defaultLoc.longitude) < 0.01 &&
          locationName !== undefined && 
          locationName.includes("Default"); // Check if it has the "(Default)" suffix
        
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
      } 
      // Case 2: No coordinates provided - try to get user's current location
      else {
        try {
          console.log("No coordinates provided, attempting to get user's location");
          
          // Initialize variables with default location
          const defaultLoc = getDefaultLocation();
          lat = defaultLoc.latitude;
          lon = defaultLoc.longitude;
          name = "New York (Default)";
          usingDefaultLocation = true;
          
          // Try to get user's current location
          const position = await getCurrentLocation();
          
          // If we get here, we successfully got the user's location
          lat = position.latitude;
          lon = position.longitude;
          
          // Check if getCurrentLocation returned the default location (New York)
          usingDefaultLocation = 
            Math.abs(position.latitude - defaultLoc.latitude) < 0.01 && 
            Math.abs(position.longitude - defaultLoc.longitude) < 0.01;

          // Get location name
          name = await getLocationName(lat, lon);
          console.log(`Resolved location to: ${name}`);
          
          // Show a message if we're using the default location
          if (usingDefaultLocation) {
            toast({
              title: "Location access denied",
              description: "We couldn't access your location. Showing weather data for New York.",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error getting location:", error);
          
          // Initialize default location
          const defaultLoc = getDefaultLocation();
          lat = defaultLoc.latitude;
          lon = defaultLoc.longitude;
          name = "New York (Default)";
          usingDefaultLocation = true;
          
          // Determine appropriate error message
          let errorMessage = "We couldn't access your location. Showing weather data for New York.";
          
          // Type guard for GeolocationPositionError
          if (error && typeof error === 'object' && 'code' in error) {
            const geoError = error as GeolocationPositionError;
            
            switch (geoError.code) {
              case 1:
                errorMessage = "Location access was denied. Please allow location access in your browser settings.";
                break;
              case 2:
                errorMessage = "Location information is unavailable. Please try searching for a specific city.";
                break;
              case 3:
                errorMessage = "Location request timed out. Please check your connection and try again.";
                break;
            }
          }
          
          toast({
            title: "Using default location",
            description: errorMessage,
            duration: 5000,
          });
        }
      }

      try {
        // Fetch weather data
        const weatherData = await fetchWeatherData(lat, lon, name)
        setCurrentWeather({
          ...weatherData,
          isDefaultLocation: cityNotFound || usingDefaultLocation
        });
        setLastUpdated(new Date())
      } catch (weatherError) {
        console.error("Weather API error:", weatherError)
        setError("Failed to load weather data. Please try again later.")
        toast({
          title: "Error loading weather data",
          description: "Failed to load weather data. Please try again later or search for a different location.",
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
    if (searchParams?.has('lat') && searchParams?.has('lon')) {
      const lat = parseFloat(searchParams.get('lat') || '0');
      const lon = parseFloat(searchParams.get('lon') || '0');
      
      // Fetch weather data using coordinates from URL
      loadWeatherData();
    } else {
      setIsLoading(true);
      getCurrentLocation()
        .then((location) => {
          // Don't need to set coordinates separately - just use them directly
          loadWeatherData();
        })
        .catch((locError) => {
          console.error("Location error:", locError);
          
          // Handle different error codes with appropriate messages
          let errorDescription = "Could not determine your location.";
          const errorCode = locError?.code || 0;
          
          if (errorCode === 1) {
            errorDescription = "Location access denied. Please allow location access or search for a city manually.";
          } else if (errorCode === 2) {
            errorDescription = "Location information unavailable. Please search for a city manually.";
          } else if (errorCode === 3) {
            errorDescription = "Location request timed out. Please try again or search for a city manually.";
          }
          
          // Default to New York if location access fails but don't set coordinates directly
          loadWeatherData();
          
          toast({
            title: "Using default location",
            description: errorDescription,
            variant: "destructive",
          });
        });
    }
  }, [searchParams, loadWeatherData, toast]);

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
        <p className="text-muted-foreground">{error || "Weather data not available. Please search for a location."}</p>
        <p className="text-sm text-muted-foreground">Try searching for a specific city using the search bar above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {currentWeather?.isDefaultLocation && locationName && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p className="font-medium">City not found</p>
            <p className="text-sm">"{locationName.replace(" (Default)", "").replace(" (Standart)", "")}" was not found. Showing weather data for New York.</p>
          </div>
        </div>
      )}
      
      {currentWeather?.isDefaultLocation && !locationName && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p className="font-medium">Using default location</p>
            <p className="text-sm">We couldn't access your location. Showing weather data for New York.</p>
          </div>
        </div>
      )}
      
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
                <div className="text-blue-50 text-xs sm:text-sm">Feels like {formatTemperature(currentWeather.feelsLike)}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Condition</p>
                <p className="font-medium text-sm md:text-base truncate">{currentWeather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Wind</p>
                <p className="font-medium text-sm md:text-base">{formatWindSpeed(currentWeather.windSpeed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Humidity</p>
                <p className="font-medium text-sm md:text-base">{currentWeather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Precipitation</p>
                <p className="font-medium text-sm md:text-base">{currentWeather.precipitation} mm</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500">
          <span>Last updated: {formatUpdateTime(lastUpdated)}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="text-sm md:text-base">Daily Forecast</TabsTrigger>
          <TabsTrigger value="hourly" className="text-sm md:text-base">Hourly Forecast</TabsTrigger>
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
