"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CloudOff className="h-16 w-16 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Siz oflayn rejimdasiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Siz internetga ulanmaganga o'xshaysiz. Oflayn rejimda ba'zi imkoniyatlar mavjud bo'lmasligi mumkin.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Qayta urinish
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Asosiy sahifaga o'tish
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
