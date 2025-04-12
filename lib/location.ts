export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to default coordinates if geolocation is not supported
      resolve(getDefaultLocation())
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.warn("Geolocation error:", error.message)
        // Fallback to default coordinates on error
        resolve(getDefaultLocation())
      },
      { timeout: 10000 },
    )
  })
}

// Update the getLocationByName function with better error handling and logging

export async function getLocationByName(locationName: string): Promise<{ latitude: number; longitude: number }> {
  try {
    console.log(`Searching for location: ${locationName}`)

    // Using OpenMeteo Geocoding API
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(10000) }, // Add timeout to prevent long waits
    )

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Geocoding API response:", data)

    if (!data.results || data.results.length === 0) {
      console.error("No results found for location:", locationName)
      // Return default location instead of throwing an error
      console.log("Using default location as fallback")
      return getDefaultLocation()
    }

    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    }
  } catch (error) {
    console.error("Error getting location by name:", error)
    // Return default location instead of throwing an error
    console.log("Using default location as fallback due to error")
    return getDefaultLocation()
  }
}

export async function getLocationName(latitude: number, longitude: number): Promise<string> {
  try {
    console.log(`Fetching location name for coordinates: ${latitude}, ${longitude}`);
    
    // Try to fetch location name from API with expanded parameters for better results
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`,
        { signal: AbortSignal.timeout(8000) } // Longer timeout for better resolution
      )

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Reverse geocoding response:", data);

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
          console.log(`Successfully resolved location name: ${locationName}`);
          return locationName;
        }
      }
    } catch (error) {
      console.warn("Error fetching location name from API:", error)
      // Try alternative geocoding service if first one fails
      try {
        console.log("Trying alternative geocoding service");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=12`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(8000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.name || data.display_name) {
            // Extract the most relevant parts (city, state, country)
            const displayParts = (data.display_name || "").split(',').map((part: string) => part.trim());
            const city = data.name || displayParts[0];
            const country = displayParts[displayParts.length - 1] || "";
            
            // Create a clean location name
            const locationName = [city, country].filter(Boolean).join(", ");
            console.log(`Alternative service resolved location: ${locationName}`);
            return locationName;
          }
        }
      } catch (altError) {
        console.warn("Alternative geocoding service failed:", altError);
        // Continue to fallback
      }
    }

    // Fallback: Generate location name from coordinates
    return generateLocationNameFromCoordinates(latitude, longitude)
  } catch (error) {
    console.error("Error getting location name:", error)
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
    region += "Northern ";
  } else {
    region += "Southern ";
  }
  
  // East, West hemisphere
  if (longitude > 0) {
    region += "Eastern";
  } else {
    region += "Western";
  }
  
  return `Location in ${region} region (${lat}°, ${lon}°)`
}

// Add a function to provide default coordinates (New York City)
export function getDefaultLocation(): { latitude: number; longitude: number } {
  return {
    latitude: 40.7128,
    longitude: -74.006, // New York City coordinates
  }
}
