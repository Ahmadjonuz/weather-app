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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, Thermometer, Droplets as DropletsIcon, Wind as WindIcon, Cloud as CloudIcon, Sunrise, Sunset, Gauge, Eye } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface WeatherDisplayProps {
  latitude?: number
  longitude?: number
  locationName?: string
  locationNotFound?: boolean
}

export function WeatherDisplay({ latitude, longitude, locationName, locationNotFound = false }: WeatherDisplayProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { formatTemperature, formatWindSpeed, addSavedLocation } = useApp()
  const searchParams = useSearchParams()
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<{ lat: number; lon: number; name: string | null }>({ lat: 0, lon: 0, name: null })

  const loadWeatherData = useCallback(async () => {
    try {
      if (isRefreshing) {
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }
      setError(null)

      let lat: number, lon: number, name: string
      let cityNotFound = locationNotFound; // Use the passed prop as a starting point
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
          locationNotFound === true ||
          (Math.abs(lat - defaultLoc.latitude) < 0.01 && 
          Math.abs(lon - defaultLoc.longitude) < 0.01 &&
          locationName !== undefined && 
          locationName.includes("Default")); // Check if it has the "(Default)" suffix
        
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
          name = "Nyu-York"
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
              title: "Joylashuvga ruxsat berilmadi",
              description: "Joylashuvga ruxsat berilmadi. Iltimos, brauzeringizda joylashuv ruxsatlarini tekshiring.",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Joylashuv olishda xatolik:", error);
          
          // Initialize default location
          const defaultLoc = getDefaultLocation();
          lat = defaultLoc.latitude;
          lon = defaultLoc.longitude;
          name = "Nyu-York"
          usingDefaultLocation = true;
          
          // Determine appropriate error message
          let errorMessage = "Joylashuvni aniqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
          
          // Type guard for GeolocationPositionError
          if (error && typeof error === 'object' && 'code' in error) {
            const geoError = error as GeolocationPositionError;
            
            switch (geoError.code) {
              case 1:
                errorMessage = "Joylashuvga ruxsat berilmadi. Iltimos, brauzeringizda joylashuv ruxsatlarini tekshiring.";
                break;
              case 2:
                errorMessage = "Joylashuv ma'lumotlari mavjud emas. Iltimos, qayta urinib ko'ring.";
                break;
              case 3:
                errorMessage = "Joylashuv so'rovi vaqti tugadi. Iltimos, qayta urinib ko'ring.";
                break;
            }
          }
          
          toast({
            title: "Joylashuvni aniqlashda xatolik",
            description: errorMessage,
            variant: "destructive",
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
        setError("Ob-havo ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.")
        toast({
          title: "Ob-havo ma'lumotlarini yuklashda xatolik",
          description: "Ob-havo ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring yoki boshqa joylashuvni qidiring.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in weather display:", error)
      setError("Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
      toast({
        title: "Xatolik",
        description: "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [latitude, longitude, locationName, locationNotFound, toast, isRefreshing])

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
          // Safe error logging - handle potential undefined or non-object errors
          console.error("Location error:", 
            typeof locError === 'object' && locError !== null 
              ? (locError as any).message || JSON.stringify(locError) 
              : "Unknown location error"
          );
          
          // Default to New York
          const defaultLoc = getDefaultLocation();
          
          // Determine appropriate error message
          let errorDescription = "Joylashuvingizni aniqlab bo'lmadi.";
          
          // Type checking before accessing properties
          if (locError && typeof locError === 'object' && locError !== null) {
            // Check for specific geolocation error codes if they exist
            const errorCode = 'code' in locError ? (locError as any).code : 0;
            
            switch (errorCode) {
              case 1:
                errorDescription = "Joylashuvga ruxsat berilmadi. Iltimos, joylashuv ruxsatini bering yoki shaharni qidiruv orqali tanlang.";
                break;
              case 2:
                errorDescription = "Joylashuv ma'lumotlari mavjud emas. Iltimos, shaharni qidiruv orqali tanlang.";
                break;
              case 3:
                errorDescription = "Joylashuv so'rovi vaqti tugadi. Iltimos, qayta urinib ko'ring yoki shaharni qidiruv orqali tanlang.";
                break;
            }
          }
          
          // Default to New York if location access fails but don't set coordinates directly
          loadWeatherData();
          
          toast({
            title: "Standart joylashuv ishlatilmoqda",
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
          <p className="text-muted-foreground">Ob-havo ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !currentWeather) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{error || "Ob-havo ma'lumotlari mavjud emas. Iltimos, manzilni qidiring."}</p>
        <p className="text-sm text-muted-foreground">Yuqoridagi qidiruv orqali aniq shaharni qidiring.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {currentWeather?.isDefaultLocation && locationName && (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p className="font-medium text-lg">Manzil topilmadi</p>
            <p className="text-sm">"{locationName.replace(" (Default)", "").replace(" (Standart)", "")}" topilmadi. Nyu-York ob-havo ma'lumotlari ko'rsatilmoqda.</p>
            <p className="text-sm mt-1">Imlo xatolarini tekshiring yoki yaqin joylashgan katta shaharni qidiring.</p>
          </div>
        </div>
      )}
      
      {/* Show a generic error when the location is not found but we don't have a name */}
      {(currentWeather?.isDefaultLocation && !locationName) || (locationNotFound && !locationName) ? (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p className="font-medium text-lg">Manzil topilmadi</p>
            <p className="text-sm">Siz kiritgan manzil bizning ma'lumotlar bazamizda topilmadi. Nyu-York ob-havo ma'lumotlari ko'rsatilmoqda.</p>
            <p className="text-sm mt-1">Imlo xatolarini tekshiring yoki yaqin joylashgan katta shaharni qidiring.</p>
          </div>
        </div>
      ) : null}
      
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
                <div className="text-blue-50 text-xs sm:text-sm">His qilinadi {formatTemperature(currentWeather.feelsLike)}</div>
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
          <span>Oxirgi yangilanish: {formatUpdateTime(lastUpdated)}</span>
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

export async function getLocationCoords() {
  try {
    const position = await getCurrentLocation();
    return {
      latitude: position.latitude,
      longitude: position.longitude,
      name: null,
    };
  } catch (locError: any) {
    // Safe error logging
    const errorMessage = locError?.message || (typeof locError === 'object' ? JSON.stringify(locError) : String(locError) || "Noma'lum xatolik");
    console.error("Joylashuv olishda xatolik:", errorMessage);
    
    // Default fallback location
    const fallbackLocation = {
      latitude: 40.7128,
      longitude: -74.006,
      name: "Nyu-York"
    };
    
    // Determine appropriate error message based on error code
    let errorDescription = "Joylashuvingizga kirish imkoni yo'q. Standart manzildan foydalanilmoqda.";
    
    if (locError?.code) {
      switch (locError.code) {
        case 1:
          errorDescription = "Joylashuvga ruxsat rad etildi. Iltimos, brauzeringiz sozlamalarida joylashuv xizmatlarini yoqing.";
          break;
        case 2:
          errorDescription = "Sizning joylashuvingiz mavjud emas. Standart manzildan foydalanilmoqda.";
          break;
        case 3:
          errorDescription = "Joylashuv so'rovi vaqti tugadi. Standart manzildan foydalanilmoqda.";
          break;
      }
    }
    
    // Use console.error instead of toast since this is a utility function
    console.error("Joylashuvga kirish xatoligi:", errorDescription);
    
    return fallbackLocation;
  }
}
