import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/lenis-provider"
import ClickSpark from "@/components/click-spark"
import { MobileMotionProvider } from "@/components/mobile-motion-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "De'Lima | Inovasi Kuliner F&B",
  description: "Dimsum lezat dan Infus Water segar. De'Lima hadir sebagai brand UMKM F&B berkualitas dengan inovasi rasa.",
  keywords: ["dimsum", "infus water", "De'Lima", "F&B", "kuliner", "UMKM"],
  generator: "v0.app",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#AFFF00",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <MobileMotionProvider>
          <ClickSpark
            sparkColor="#AFFF00"
            sparkSize={12}
            sparkRadius={20}
            sparkCount={8}
            duration={400}
            easing="ease-out"
          >
            <LenisProvider>{children}</LenisProvider>
          </ClickSpark>
        </MobileMotionProvider>
        <Analytics />
      </body>
    </html>
  )
}
