import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CompliHealth - Healthcare Insurance Management Platform",
  description:
    "Comprehensive healthcare insurance management platform for customers, hospitals, TPAs, and insurers. Streamline claims, policies, and provider networks with CompliHealth.",
  keywords: ["healthcare", "insurance", "claims management", "TPA", "hospital management", "policy management"],
  authors: [{ name: "CompliHealth Team" }],
  creator: "CompliHealth",
  publisher: "CompliHealth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://complihealth.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CompliHealth - Healthcare Insurance Management Platform",
    description:
      "Comprehensive healthcare insurance management platform for all stakeholders in the healthcare ecosystem.",
    url: "https://complihealth.com",
    siteName: "CompliHealth",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CompliHealth Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CompliHealth - Healthcare Insurance Management Platform",
    description:
      "Comprehensive healthcare insurance management platform for all stakeholders in the healthcare ecosystem.",
    images: ["/twitter-image.jpg"],
    creator: "@complihealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
