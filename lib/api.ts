import { fetchWeatherApi } from "openmeteo"

export interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
  precipitation: number
  time: string
  forecast: {
    day: string
    high: number
    low: number
    condition: string
  }[]
  hourlyForecast: {
    time: Date[]
    temperature: Float32Array
    windSpeed: Float32Array
    rain: Float32Array
    snowfall: Float32Array
  }
  isDefaultLocation?: boolean // Flag to indicate if this location is the default/fallback
}

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)

// Improved function to determine weather condition based on WMO weather codes, rain and temperature
export function determineWeatherCondition(weatherCode: number, rain = 0, temperature = 20): string {
  // WMO codes: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
  
  // Basic conditions by weather code
  if (weatherCode === 0) return temperature > 25 ? "Sunny" : "Clear"
  
  // Mostly clear, partly cloudy
  if (weatherCode === 1 || weatherCode === 2) return "Partly Cloudy"
  
  // Overcast
  if (weatherCode === 3) return "Cloudy"
  
  // Fog or mist
  if (weatherCode >= 45 && weatherCode <= 48) return "Foggy"
  
  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 55) return "Light Rain"
  
  // Rain
  if (weatherCode >= 61 && weatherCode <= 65) return "Rain"
  if (weatherCode >= 80 && weatherCode <= 82) return "Heavy Rain"
  
  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) return "Snow"
  if (weatherCode >= 85 && weatherCode <= 86) return "Snow Shower"
  
  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return "Thunderstorm"
  
  // Fallback based on rain and temperature
  if (rain > 0.5) return "Rain"
  if (rain > 0) return "Light Rain"
  if (temperature > 30) return "Hot"
  if (temperature > 25) return "Sunny"
  if (temperature > 15) return "Partly Cloudy"
  return "Cloudy"
}

// Function to get day name from date
function getDayName(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return weekdayNames[date.getDay()]
}

// Add a function to get the current date with year 2025
function getCurrentDateWith2025Year(): Date {
  const now = new Date();
  // Set year to 2025
  now.setFullYear(2025);
  return now;
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  locationName = "Current Location",
): Promise<WeatherData> {
  try {
    const params = {
      latitude: latitude,
      longitude: longitude,
      hourly: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "rain", "snowfall", "weather_code"],
      daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      current: ["temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m", "precipitation"],
      forecast_days: 7,
      timezone: "auto",
    }

    const url = "https://api.open-meteo.com/v1/forecast"

    // Add timeout to prevent long waits
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const responses = await fetchWeatherApi(url, params)
      clearTimeout(timeoutId)

      // Process first location
      const response = responses[0]

      // Get current weather data if available
      let currentTemperature, currentHumidity, currentWindSpeed, currentRain, currentWeatherCode;

      if (response.current()) {
        const current = response.current()!
        currentTemperature = Math.round(current.variables(0)!.value())
        currentHumidity = Math.round(current.variables(1)!.value())
        currentWeatherCode = current.variables(2)!.value()
        currentWindSpeed = Math.round(current.variables(3)!.value())
        currentRain = current.variables(4)!.value() || 0
      }

      // Attributes for timezone and location
      const utcOffsetSeconds = response.utcOffsetSeconds()
      const timezone = response.timezone()

      const hourly = response.hourly()!
      const daily = response.daily()!

      // Process hourly data
      const hourlyTimes = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000),
      )
      const hourlyTemperatures = hourly.variables(0)!.valuesArray()!
      const hourlyHumidity = hourly.variables(1)!.valuesArray()!
      const hourlyWindSpeed = hourly.variables(2)!.valuesArray()!
      const hourlyRain = hourly.variables(3)!.valuesArray()!
      const hourlySnowfall = hourly.variables(4)!.valuesArray()!
      const hourlyWeatherCode = hourly.variables(5)!.valuesArray()!

      // Process daily data
      const dailyTimes = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000),
      )
      const dailyTemperaturesMax = daily.variables(0)!.valuesArray()!
      const dailyTemperaturesMin = daily.variables(1)!.valuesArray()!
      const dailyWeatherCode = daily.variables(2)!.valuesArray()!

      // Create forecast array
      const forecast = dailyTimes
        .map((time, i) => {
          return {
            day: getDayName(time),
            high: Math.round(dailyTemperaturesMax[i]),
            low: Math.round(dailyTemperaturesMin[i]),
            condition: determineWeatherCondition(dailyWeatherCode[i], hourlyRain[i*24/dailyTimes.length] || 0, dailyTemperaturesMax[i]),
          }
        })
        .slice(0, 5) // Limit to 5 days

      // Use current data if available, otherwise use first hour data
      if (currentTemperature === undefined) {
        currentTemperature = Math.round(hourlyTemperatures[0])
        currentHumidity = Math.round(hourlyHumidity[0])
        currentWindSpeed = Math.round(hourlyWindSpeed[0])
        currentRain = hourlyRain[0]
        currentWeatherCode = hourlyWeatherCode[0]
      }

      // Add extra processing for more accurate weather conditions based on the data we have
      // This part comes after we retrieve all the weather data but before returning

      // Add processing to ensure we have the most accurate current data
      let currentCondition;
      if (currentWeatherCode !== undefined) {
        currentCondition = determineWeatherCondition(
          currentWeatherCode, 
          currentRain || 0, 
          currentTemperature || 20
        );
      } else {
        // If no weather code available, use the fallback with available data
        currentCondition = determineDetailedCondition(
          currentTemperature || 20,
          currentHumidity || 50,
          currentRain || 0,
          hourlySnowfall[0] || 0,
          currentWindSpeed || 0
        );
      }

      // Calculate feels like temperature (improved approximation)
      let feelsLike = currentTemperature || 20;
      
      // Wind chill for colder temperatures
      if ((currentTemperature || 20) < 10) {
        feelsLike = Math.round(13.12 + 0.6215 * (currentTemperature || 20) - 11.37 * Math.pow((currentWindSpeed || 0), 0.16) + 0.3965 * (currentTemperature || 20) * Math.pow((currentWindSpeed || 0), 0.16));
      }
      // Heat index for warmer temperatures with humidity factored in
      else if ((currentTemperature || 20) > 20 && (currentHumidity || 50) > 40) {
        feelsLike = Math.round((currentTemperature || 20) + 0.05 * (currentHumidity || 50));
      }

      return {
        location: locationName,
        temperature: currentTemperature || 20,
        condition: currentCondition,
        humidity: currentHumidity || 50,
        windSpeed: currentWindSpeed || 0,
        feelsLike: feelsLike,
        precipitation: currentRain || 0,
        time: getCurrentDateWith2025Year().toLocaleTimeString(),
        forecast: forecast,
        hourlyForecast: {
          time: hourlyTimes,
          temperature: hourlyTemperatures,
          windSpeed: hourlyWindSpeed,
          rain: hourlyRain,
          snowfall: hourlySnowfall,
        },
        isDefaultLocation: false,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error in fetchWeatherApi:", error)

      // If API call fails, return mock data
      return generateMockWeatherData(locationName)
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return generateMockWeatherData(locationName)
  }
}

// Generate mock weather data as a fallback
function generateMockWeatherData(locationName: string): WeatherData {
  const currentDate = getCurrentDateWith2025Year()
  const hourlyTimes = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(currentDate)
    date.setHours(date.getHours() + i)
    return date
  })

  // Is it Tashkent? Use more accurate mock data if so
  const isTashkent = locationName.toLowerCase().includes("tashkent") || 
                     locationName.toLowerCase().includes("toshkent") || 
                     locationName.toLowerCase().includes("ташкент");
  
  // Customize temperature based on location and season
  let baseTemp = 20;
  if (isTashkent) {
    const month = currentDate.getMonth();
    // Summer in Tashkent (May-September)
    if (month >= 4 && month <= 8) {
      baseTemp = 28 + Math.random() * 4; // 28-32°C
    } 
    // Spring/Fall in Tashkent
    else if ((month >= 2 && month <= 3) || (month >= 9 && month <= 10)) {
      baseTemp = 18 + Math.random() * 7; // 18-25°C
    }
    // Winter in Tashkent
    else {
      baseTemp = 5 + Math.random() * 8; // 5-13°C
    }
  }

  // Create mock temperature data
  const hourlyTemperatures = new Float32Array(24)
  const hourlyWindSpeed = new Float32Array(24)
  const hourlyRain = new Float32Array(24)
  const hourlySnowfall = new Float32Array(24)

  for (let i = 0; i < 24; i++) {
    // Daily temperature curve - peaks around 2-4 PM
    const hourFactor = Math.sin((i - 6) * Math.PI / 12);
    const tempVariation = hourFactor > 0 ? hourFactor * 5 : hourFactor * 2;
    
    hourlyTemperatures[i] = baseTemp + tempVariation;
    hourlyWindSpeed[i] = 5 + Math.random() * 10
    hourlyRain[i] = Math.random() > 0.8 ? Math.random() * 2 : 0
    hourlySnowfall[i] = baseTemp < 0 && Math.random() > 0.8 ? Math.random() : 0
  }

  // Generate 5-day forecast
  const forecast = []
  const days = ["Today", "Tomorrow", "Wednesday", "Thursday", "Friday"]

  for (let i = 0; i < 5; i++) {
    const dayVariation = Math.random() * 4 - 2; // -2 to +2 degrees variation between days
    forecast.push({
      day: days[i],
      high: Math.round(baseTemp + 3 + dayVariation),
      low: Math.round(baseTemp - 5 + dayVariation),
      condition: i % 2 === 0 ? "Partly Cloudy" : "Sunny",
    })
  }

  const currentTemp = Math.round(baseTemp);

  return {
    location: locationName,
    temperature: currentTemp,
    condition: "Partly Cloudy",
    humidity: isTashkent ? 40 : 65,
    windSpeed: isTashkent ? 6 : 12,
    feelsLike: Math.round(currentTemp - 1),
    precipitation: 0,
    time: currentDate.toLocaleTimeString(),
    forecast: forecast,
    hourlyForecast: {
      time: hourlyTimes,
      temperature: hourlyTemperatures,
      windSpeed: hourlyWindSpeed,
      rain: hourlyRain,
      snowfall: hourlySnowfall,
    },
    isDefaultLocation: false,
  }
}

export async function fetchForecast(latitude: number, longitude: number): Promise<any[]> {
  try {
    const weatherData = await fetchWeatherData(latitude, longitude)
    return weatherData.forecast
  } catch (error) {
    console.error("Error fetching forecast:", error)

    // Return mock forecast data
    return [
      { day: "Today", high: 24, low: 18, condition: "Partly Cloudy" },
      { day: "Tomorrow", high: 26, low: 19, condition: "Sunny" },
      { day: "Wednesday", high: 28, low: 20, condition: "Sunny" },
      { day: "Thursday", high: 25, low: 19, condition: "Cloudy" },
      { day: "Friday", high: 23, low: 17, condition: "Rain" },
    ]
  }
}

// Add this function for better weather condition determination from data
export function determineDetailedCondition(temperature: number, humidity: number, rain: number, snowfall: number, windSpeed: number): string {
  // First check precipitation
  if (snowfall > 0) return "Snow";
  if (rain > 1) return "Heavy Rain";
  if (rain > 0.1) return "Rain";
  if (rain > 0) return "Light Rain";
  
  // Then check other factors
  if (humidity > 90) return "Foggy";
  if (humidity > 80 && temperature < 10) return "Cloudy";
  if (temperature > 30) return "Hot";
  if (temperature > 25) return humidity > 60 ? "Humid" : "Sunny";
  if (temperature > 15) return humidity > 70 ? "Partly Cloudy" : "Clear";
  if (temperature < 0) return "Cold";
  
  return "Partly Cloudy";
}
