import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CloudSun, ExternalLink } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Ob-havo Ilovasi Haqida</h1>
          <p className="text-muted-foreground">Bizning ob-havo prognozi xizmati haqida ko'proq ma'lumot oling</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bizning Vazifamiz</CardTitle>
            <CardDescription>Hamma uchun aniq ob-havo ma'lumotlarini taqdim etish</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-justify">
              Ob-havo Ilovasi oddiy maqsad bilan yaratilgan: dunyo bo'ylab foydalanuvchilar uchun aniq, tushunish oson bo'lgan ob-havo prognozlarini taqdim etish. Biz ishonchli ob-havo ma'lumotlari hamma uchun, ular qayerda bo'lishidan qat'i nazar, mavjud bo'lishi kerak deb hisoblaymiz.
            </p>
            <p className="text-justify">
              Bizning ilovamiz chiroyli dizayn va kuchli funksionallikni birlashtiradi, bu ob-havoni bir qarashda tekshirishni osonlashtiradi, shu bilan birga chuqurroq ma'lumot istaydiganlar uchun batafsilroq ma'lumotlarni ham taqdim etadi.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open-meteo bilan ishlaydi</CardTitle>
            <CardDescription>Bepul va ochiq manbali ob-havo API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-justify">
              Biz Open-meteo bilan hamkorlik qilishdan faxrlanamiz - bu butun dunyo bo'ylab aniq prognozlar taqdim etuvchi bepul va ochiq manbali ob-havo API. Open-meteo API kalitlarisiz yoki murakkab sozlashlarsiz yuqori sifatli ob-havo ma'lumotlarini taqdim etadi.
            </p>
            <div className="flex justify-center py-4">
              <CloudSun className="h-24 w-24 text-sky-500" />
            </div>
            <div className="flex justify-center">
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  Open-meteo saytiga tashrif buyurish <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imkoniyatlar</CardTitle>
            <CardDescription>Bizning ob-havo ilovamizni nima alohida qiladi</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dunyo bo'ylab istalgan joy uchun real vaqt ob-havo yangiliklari</li>
              <li>Oldinga rejalashtirish uchun batafsil 5 kunlik prognozlar</li>
              <li>Chiroyli, intuitiv interfeys, foydalanish oson</li>
              <li>Tunda qulay ko'rish uchun qorong'i rejim qo'llab-quvvatlash</li>
              <li>Barcha qurilmalaringizda ishlashga moslashtirilgan dizayn</li>
              <li>Reklamasiz bepul foydalanish</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
              Ob-havoni Tekshirish
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
