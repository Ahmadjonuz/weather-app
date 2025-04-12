"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/contexts/app-context"
import { FixedWeatherAnimation } from "@/components/fixed-weather-animation"

interface ForecastDay {
  day: string
  high: number
  low: number
  condition: string
}

interface WeatherForecastProps {
  forecast: ForecastDay[]
}

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  const { formatTemperature } = useApp()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
      {forecast.map((day, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-2 md:p-4 text-center">
            <p className="font-medium text-xs sm:text-sm md:text-base">{day.day}</p>
            <div className="my-2 md:my-3 flex justify-center h-6 md:h-8">
              <FixedWeatherAnimation condition={day.condition} size="small" />
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="font-medium">{formatTemperature(day.high)}</span>
              <span className="text-muted-foreground">{formatTemperature(day.low)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
