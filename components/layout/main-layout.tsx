"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, FileText, Users, Building2, Shield, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const roleConfig = {
  customer: {
    name: "Customer Portal",
    icon: Users,
    color: "bg-blue-500",
    navigation: [
      { href: "/dashboard", label: "Dashboard", icon: Activity },
      { href: "/policies", label: "My Policies", icon: Shield },
      { href: "/claims", label: "My Claims", icon: FileText },
      { href: "/providers", label: "Find Providers", icon: Building2 },
    ],
  },
  hospital: {
    name: "Hospital Portal",
    icon: Building2,
    color: "bg-green-500",
    navigation: [
      { href: "/dashboard", label: "Dashboard", icon: Activity },
      { href: "/claims", label: "Submit Claims", icon: FileText },
      { href: "/pre-auth", label: "Pre-Authorization", icon: Shield },
      { href: "/patients", label: "Patient Coverage", icon: Users },
    ],
  },
  tpa: {
    name: "TPA Portal",
    icon: FileText,
    color: "bg-orange-500",
    navigation: [
      { href: "/dashboard", label: "Dashboard", icon: Activity },
      { href: "/claims", label: "Process Claims", icon: FileText },
      { href: "/policies", label: "Manage Policies", icon: Shield },
      { href: "/providers", label: "Provider Network", icon: Building2 },
    ],
  },
  insurer: {
    name: "Insurer Portal",
    icon: Shield,
    color: "bg-purple-500",
    navigation: [
      { href: "/dashboard", label: "Dashboard", icon: Activity },
      { href: "/analytics", label: "Analytics", icon: Activity },
      { href: "/policies", label: "All Policies", icon: Shield },
      { href: "/claims", label: "Claims Overview", icon: FileText },
    ],
  },
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const config = roleConfig[user.role]
  const IconComponent = config.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{config.name}</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Welcome back</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.organization && (
                  <Badge variant="secondary" className="text-xs">
                    {user.organization}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <nav className="px-4 space-y-2">
          {config.navigation.map((item) => {
            const NavIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <NavIcon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{config.name}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
