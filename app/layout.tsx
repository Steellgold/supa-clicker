import { Geist_Mono } from "next/font/google"
import type { Component } from "@/type/component"
import type { PropsWithChildren } from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/lib/auth/auth-context"
import { GameProvider } from "@/lib/providers/game-provider"
import "./globals.css"

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supa Clicker",
  description: "A simple clicker game built with Next.js and Tailwind CSS for the Supabase Hackathon of LW15.",
  openGraph: {
    title: "Supa Clicker",
    description: "A simple clicker game built with Next.js and Tailwind CSS for the Supabase Hackathon of LW15.",
    url: "https://supaclicker.vercel.app",
    siteName: "Supa Clicker",
    images: [
      {
        url: "https://supaclicker.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Supa Clicker OG Image"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Supa Clicker",
    description: "A simple clicker game built with Next.js and Tailwind CSS for the Supabase Hackathon of LW15.",
    images: ["https://supaclicker.vercel.app/og-image.png"]
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png"
  }
}

const RootLayout: Component<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${geistMono.className} antialiased bg-background text-foreground`}>
        <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.svg')] opacity-10 mix-blend-screen h-screen" />

        <AuthProvider>
          <GameProvider>
            <main className="relative z-10">{children}</main>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export default RootLayout