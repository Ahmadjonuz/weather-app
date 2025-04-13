import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AppProvider } from "@/contexts/app-context"
import { ServiceWorkerRegister } from "./sw-register"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Weather App | Real-time Weather Forecasts",
  description: "Get accurate weather forecasts with our beautiful weather app powered by Open-meteo",
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
  generator: 'Weather App Team'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            <div className="flex min-h-screen flex-col animated-gradient relative">
              <div className="flex flex-col flex-1 z-10">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </AppProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}


import './globals.css'