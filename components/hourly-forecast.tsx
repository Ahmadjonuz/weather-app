"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Wind } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useApp } from "@/contexts/app-context"
import { FixedWeatherAnimation } from "@/components/fixed-weather-animation"

interface HourlyForecastProps {
  hourlyData: {
    time: Date[]
    temperature: Float32Array
    windSpeed: Float32Array
    rain: Float32Array
    snowfall: Float32Array
  }
}

export function HourlyForecast({ hourlyData }: HourlyForecastProps) {
  const { convertTemperature, formatTemperature, formatWindSpeed } = useApp()

  // Format data for the chart - take next 24 hours
  const chartData = Array.from({ length: 24 }, (_, i) => {
    return {
      time: hourlyData.time[i].toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperature: convertTemperature(hourlyData.temperature[i]),
      windSpeed: hourlyData.windSpeed[i],
      rain: hourlyData.rain[i],
      snowfall: hourlyData.snowfall[i],
    }
  })

  const determineWeatherCondition = (rain: number, temperature: number): string => {
    if (rain > 0.5) return "Rain"
    if (rain > 0) return "Partly Cloudy"
    if (temperature > 25) return "Sunny"
    if (temperature > 15) return "Partly Cloudy"
    return "Cloudy"
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={30} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="temperature" stroke="#0ea5e9" name="Temperature" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
        {chartData.slice(0, 6).map((hour, index) => {
          const condition = determineWeatherCondition(hour.rain, hour.temperature)
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-2 md:p-4 text-center">
                <p className="font-medium text-sm">{hour.time}</p>
                <div className="my-2 md:my-3 flex justify-center h-6 md:h-8">
                  <FixedWeatherAnimation condition={condition} size="small" />
                </div>
                <div className="text-lg md:text-xl font-bold">{formatTemperature(hour.temperature)}</div>
                <div className="flex justify-between text-[10px] md:text-xs mt-2">
                  <div className="flex items-center">
                    <Wind className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{formatWindSpeed(hour.windSpeed)}</span>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{hour.rain} mm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
