import type React from "react"
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Analytics</span>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
