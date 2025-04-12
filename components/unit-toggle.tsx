"use client"

import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Thermometer } from "lucide-react"

export function UnitToggle() {
  const { unit, toggleUnit } = useApp()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleUnit}
      className="flex items-center gap-1"
      aria-label={`${unit === "metric" ? "imperial" : "metric"} birliklariga o'tish`}
    >
      <Thermometer className="h-4 w-4" />
      <span>{unit === "metric" ? "°C" : "°F"}</span>
    </Button>
  )
}
