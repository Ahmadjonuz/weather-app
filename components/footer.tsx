import Link from "next/link"
import { Cloud } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Cloud className="h-6 w-6 text-sky-500" />
              <span className="text-xl font-bold">Ob-havo Ilovasi</span>
            </Link>
            <p className="text-sm text-muted-foreground">Open-meteo tomonidan quvvatlanadigan aniq ob-havo prognozlari</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Navigatsiya</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    Asosiy
                  </Link>
                </li>
                <li>
                  <Link href="/forecast" className="text-muted-foreground hover:text-foreground">
                    Prognoz
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    Biz haqimizda
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Resurslar</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Open-meteo API
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Huquqiy</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Maxfiylik siyosati
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Foydalanish shartlari
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ob-havo Ilovasi. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  )
}
