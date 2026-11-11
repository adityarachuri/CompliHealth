import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Patient Coverage | Healthcare Insurance",
  description: "View detailed insurance coverage information, benefits, deductibles, and out-of-pocket costs.",
}

export default function CoverageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
