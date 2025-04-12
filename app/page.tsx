import { Search } from "@/components/search"
import { WeatherDisplay } from "@/components/weather-display"
import { HeroSection } from "@/components/hero-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen relative isolate overflow-hidden">
      <div className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
            <Info className="h-4 w-4" />
            <AlertTitle>Location Access</AlertTitle>
            <AlertDescription>
              For the best experience, please allow location access when prompted. Alternatively, you can search for any
              location below.
            </AlertDescription>
          </Alert>
          <Search />
          <WeatherDisplay />
        </div>
      </div>
    </main>
  )
}
