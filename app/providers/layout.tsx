import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Providers - Healthcare Insurance Portal",
  description: "Search and find healthcare providers in your network",
}

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
