import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { GameLaunchSettingsProvider } from "../components/GameLaunchSettingsPanel"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "KittenGames",
  description: "Free unblocked games!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="1f0a416d-67e8-435f-b6ec-9af2a2fa359f"></script>
      </head>
      <body className={`${inter.className} bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}>
        <GameLaunchSettingsProvider>
          {children}
        </GameLaunchSettingsProvider>
      </body>
    </html>
  )
}
