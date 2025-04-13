import { WeatherDisplay } from "@/components/weather-display"
import HeroSection from "@/components/hero-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen relative isolate overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900">
      <div className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
            <Info className="h-4 w-4" />
            <AlertTitle>Joylashuv ruxsati</AlertTitle>
            <AlertDescription>
              Eng yaxshi tajriba uchun, so'ralganda joylashuv ruxsatini bering. Yoki yuqoridagi qidiruv paneli orqali istalgan joyni qidirishingiz mumkin.
            </AlertDescription>
          </Alert>
          <WeatherDisplay />
        </div>
      </div>
    </main>
  )
}
