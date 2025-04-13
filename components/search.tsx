"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search as SearchIcon, Loader2, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getCurrentLocation, getLocationByName, getLocationName } from "@/lib/location"
import { useToast } from "./ui/use-toast"
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { getLocationCoords } from "@/components/weather-display"

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

const formSchema = z.object({
  location: z.string().min(1, "Manzil kiritish zarur"),
})

export function Search({ className = "" }: { className?: string }) {
  const router = useRouter()
  const { toast: showToast } = useToast()
  const searchParams = useSearchParams()
  const notFound = searchParams?.get("notFound") === "true"
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  })

  // Handle notification for not found location
  useEffect(() => {
    if (notFound) {
      showToast({
        title: "Joylashuv topilmadi",
        description: "Siz kiritgan joylashuv topilmadi. Iltimos, boshqa joylashuvni qidirib ko'ring.",
        variant: "destructive",
      })
    }
  }, [notFound, showToast])

  // Handle client-side rendering
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return null
  }

  const handleSearch = async (values: z.infer<typeof formSchema>) => {
    if (!values.location.trim()) {
      toast.error("Iltimos, manzilni kiriting", {
        description: "Ob-havo ma'lumotlarini ko'rish uchun shahar yoki manzilni kiriting"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalize the search term by converting to lowercase and trimming
      const searchTerm = values.location.trim().toLowerCase();
      
      // Check if the search term matches a predefined major city
      if (MAJOR_CITIES[searchTerm]) {
        const { latitude, longitude } = MAJOR_CITIES[searchTerm];
        router.push(`/forecast?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent(values.location)}`);
        return;
      }
      
      // Fallback to geocoding API if not a predefined city
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`);
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        setIsLoading(false);
        toast.error("Manzil topilmadi", {
          description: "Kiritilgan manzil topilmadi. Imlo xatolarini tekshiring yoki boshqa manzilni kiriting."
        });
        router.push(`/forecast?locationNotFound=true&defaultLocation=true`);
        return;
      }
      
      const { latitude, longitude, name } = geoData.results[0];
      
      // Construct the formatted location string
      let formattedLocation = name;
      if (geoData.results[0].admin1) formattedLocation += `, ${geoData.results[0].admin1}`;
      if (geoData.results[0].country) formattedLocation += `, ${geoData.results[0].country}`;
      
      router.push(`/forecast?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent(formattedLocation)}`);
      
    } catch (error) {
      setIsLoading(false);
      toast.error("Xatolik yuz berdi", {
        description: "Ma'lumotlarni olishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      });
      console.error("Error fetching location data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const coords = await getLocationCoords();
      router.push(`/forecast?lat=${coords.latitude}&lon=${coords.longitude}`);
    } catch (error) {
      console.error("Error getting current location:", error);
      toast.error("Joylashuvni aniqlashda xatolik", {
        description: "Joriy joylashuvingizni aniqlab bo'lmadi. Iltimos, brauzer sozlamalarida joylashuv xizmatlariga ruxsat bering.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="flex flex-row gap-2">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative items-center">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        className="pl-9 pr-14 py-2 bg-background"
                        placeholder="Shahar yoki manzilni kiriting..."
                        disabled={isLoading}
                        {...field}
                      />
                      <div className="absolute right-2 top-0.5 -mt-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleCurrentLocation}
                          disabled={isLoading}
                          title="Joriy joyni aniqlash"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button 
            type="submit" 
            variant="default" 
            className="h-10 px-4" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qidirish"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
