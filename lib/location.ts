// Add a mapping of major cities to ensure accurate results
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

// Define a custom error type to ensure proper error shape
interface LocationError extends Error {
  code: number;
  message: string;
}

// Helper function to create a properly formatted location error
function createLocationError(message: string, code: number = 0): LocationError {
  const error = new Error(message) as LocationError;
  error.code = code;
  error.message = message;
  return error;
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn("Geolokatsiya qo'llab-quvvatlanmaydi");
      reject(createLocationError("Bu brauzer geolokatsiyani qo'llab-quvvatlamaydi", 0));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        // GeolocationPositionError has code and message properties
        console.warn("Geolokatsiya xatosi:", geoError.message);
        
        // Use our helper function to create a properly formatted error
        reject(createLocationError(
          geoError.message || "Noma'lum geolokatsiya xatosi", 
          geoError.code || 0
        ));
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  });
}

// Update the getLocationByName function with better error handling and logging

export async function getLocationByName(locationName: string): Promise<{ latitude: number; longitude: number }> {
  try {
    console.log(`Joylashuv qidirilmoqda: ${locationName}`)
    
    // Check if the location is a known major city (case-insensitive)
    const normalizedInput = locationName.trim().toLowerCase();
    
    // Check for direct matches in our predefined list
    if (MAJOR_CITIES[normalizedInput]) {
      const coords = MAJOR_CITIES[normalizedInput];
      console.log(`${locationName} uchun oldindan belgilangan koordinatalar ishlatilmoqda: ${coords.latitude}, ${coords.longitude}`);
      return coords;
    }
    
    // Otherwise check for partial matches in major cities
    for (const [cityName, coords] of Object.entries(MAJOR_CITIES)) {
      if (normalizedInput.includes(cityName) || cityName.includes(normalizedInput)) {
        console.log(`${locationName} uchun ${cityName} bilan qisman mos keldi`);
        return coords;
      }
    }

    // Using OpenMeteo Geocoding API which doesn't require API key
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=5&language=en&format=json`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API javob berdi: ${response.status} holati`)
      throw createLocationError(`API javob berdi: ${response.status} holati`, response.status);
    }

    const data = await response.json()
    console.log("Geocoding API javobi:", data)

    if (!data.results || data.results.length === 0) {
      console.error("Joylashuv uchun natija topilmadi:", locationName)
      // Return default location instead of throwing an error
      console.log("Standart joylashuv ishlatilmoqda")
      return getDefaultLocation()
    }

    // Check if any result has a high match score - prefer administrative divisions (capitals, major cities)
    const bestMatch = data.results.find(
      (result: any) => result.admin_level === 4 || result.admin_level === 6 || result.feature_code === "PPLC"
    ) || data.results[0]; // Fall back to first result if no administrative match
    
    return {
      latitude: bestMatch.latitude,
      longitude: bestMatch.longitude,
    }
  } catch (error) {
    console.error("Nom bo'yicha joylashuvni olishda xatolik:", error)
    // Return default location instead of throwing an error
    console.log("Xatolik tufayli standart joylashuv ishlatilmoqda")
    return getDefaultLocation()
  }
}

export async function getLocationName(latitude: number, longitude: number): Promise<string> {
  try {
    console.log(`Koordinatalar uchun joylashuv nomi olinmoqda: ${latitude}, ${longitude}`);
    
    // Try to fetch location name from API with expanded parameters for better results
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API javob berdi: ${response.status} holati`)
      }

      const data = await response.json()
      console.log("Teskari geocoding javobi:", data);

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const parts = []
        
        // Add city name - most important part
        if (result.name) {
          parts.push(result.name)
        }
        
        // Add state/region if available (for some countries)
        if (result.admin1) {
          // Only add if it's different from the city name to avoid redundancy
          if (result.admin1 !== result.name) {
            parts.push(result.admin1)
          }
        }
        
        // Add country - only if we have a city or region already
        if (result.country && parts.length > 0) {
          parts.push(result.country)
        }
        
        // If we have at least one part, return the joined string
        if (parts.length > 0) {
          const locationName = parts.join(", ");
          console.log(`Joylashuv nomi muvaffaqiyatli aniqlandi: ${locationName}`);
          return locationName;
        }
      }
    } catch (error) {
      console.warn("API dan joylashuv nomini olishda xatolik:", error)
      // Try alternative geocoding service if first one fails
      try {
        console.log("Muqobil geocoding xizmati ishlatilmoqda");
        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => altController.abort(), 8000);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=12`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: altController.signal
          }
        );
        
        clearTimeout(altTimeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.name || data.display_name) {
            // Extract the most relevant parts (city, state, country)
            const displayParts = (data.display_name || "").split(',').map((part: string) => part.trim());
            const city = data.name || displayParts[0];
            const country = displayParts[displayParts.length - 1] || "";
            
            // Create a clean location name
            const locationName = [city, country].filter(Boolean).join(", ");
            console.log(`Muqobil xizmat joylashuvni aniqladi: ${locationName}`);
            return locationName;
          }
        }
      } catch (altError) {
        console.warn("Muqobil geocoding xizmati ishlamadi:", altError);
        // Continue to fallback
      }
    }

    // Fallback: Generate location name from coordinates
    return generateLocationNameFromCoordinates(latitude, longitude)
  } catch (error) {
    console.error("Joylashuv nomini olishda xatolik:", error)
    return generateLocationNameFromCoordinates(latitude, longitude)
  }
}

// Generate a location name from coordinates when API fails
function generateLocationNameFromCoordinates(latitude: number, longitude: number): string {
  // Format coordinates to 2 decimal places in a user-friendly way
  const lat = latitude.toFixed(2)
  const lon = longitude.toFixed(2)
  
  // Try to determine region from coordinates (very rough approximation)
  let region = "";
  
  // North, South hemisphere
  if (latitude > 0) {
    region += "Shimoliy ";
  } else {
    region += "Janubiy ";
  }
  
  // East, West hemisphere
  if (longitude > 0) {
    region += "Sharqiy";
  } else {
    region += "G'arbiy";
  }
  
  return `${region} mintaqadagi joylashuv (${lat}°, ${lon}°)`
}

// Add a function to provide default coordinates (New York City)
export function getDefaultLocation(): { latitude: number; longitude: number } {
  return {
    latitude: 40.7128,
    longitude: -74.006, // New York City coordinates
  }
}
