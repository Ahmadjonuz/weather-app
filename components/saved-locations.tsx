"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, Plus, X, ChevronDown, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function SavedLocations() {
  const { savedLocations, addSavedLocation, removeSavedLocation } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleAddCurrentLocation = () => {
    // Get current location from URL or use geolocation
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      const lat = url.searchParams.get("lat")
      const lon = url.searchParams.get("lon")
      const name = url.searchParams.get("name")

      if (lat && lon && name) {
        addSavedLocation({
          name: decodeURIComponent(name),
          latitude: Number.parseFloat(lat),
          longitude: Number.parseFloat(lon),
        })
        toast({
          title: "Location saved",
          description: `${decodeURIComponent(name)} has been added to your saved locations.`,
        })
      } else {
        // If no location in URL, prompt user to search for a location first
        toast({
          title: "No location selected",
          description: "Please search for a location first before saving it.",
          variant: "destructive",
        })
      }
    }
  }

  const handleLocationSelect = (location: { latitude: number; longitude: number; name: string }) => {
    router.push(
      `/forecast?lat=${location.latitude}&lon=${location.longitude}&name=${encodeURIComponent(location.name)}`,
    )
    setIsOpen(false)
  }

  const handleRemoveLocation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeSavedLocation(id)
    toast({
      title: "Location removed",
      description: "The location has been removed from your saved locations.",
    })
  }

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Saved</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleAddCurrentLocation}>
              <Plus className="mr-2 h-4 w-4" />
              Save current location
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {savedLocations.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No saved locations yet</div>
            ) : (
              savedLocations.map((location) => (
                <DropdownMenuItem
                  key={location.id}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{location.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleRemoveLocation(e, location.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
