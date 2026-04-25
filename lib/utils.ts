import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CompliHealth utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
  return phoneRegex.test(phone)
}

export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getRoleDisplayName(role: string): string {
  const roleMap = {
    customer: "Customer",
    hospital: "Hospital Staff",
    tpa: "TPA Administrator",
    insurer: "Insurance Provider",
  }
  return roleMap[role as keyof typeof roleMap] || role
}

export function getStatusColor(status: string): string {
  const statusColors = {
    approved: "text-green-600 bg-green-100",
    pending: "text-orange-600 bg-orange-100",
    rejected: "text-red-600 bg-red-100",
    processing: "text-blue-600 bg-blue-100",
    completed: "text-green-600 bg-green-100",
    cancelled: "text-gray-600 bg-gray-100",
  }
  return statusColors[status as keyof typeof statusColors] || "text-gray-600 bg-gray-100"
}

export function validateClaimAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 // Max $1M claim
}

export function validatePolicyNumber(policyNumber: string): boolean {
  const policyRegex = /^[A-Z]{2}\d{8}$/
  return policyRegex.test(policyNumber)
}

export function formatPolicyNumber(policyNumber: string): string {
  if (policyNumber.length === 10) {
    return `${policyNumber.slice(0, 2)}-${policyNumber.slice(2, 6)}-${policyNumber.slice(6)}`
  }
  return policyNumber
}

export function calculateCoveragePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

export function getNextBusinessDay(date: Date = new Date()): Date {
  const nextDay = new Date(date)
  nextDay.setDate(date.getDate() + 1)

  // Skip weekends
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1)
  }

  return nextDay
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6 // Not Sunday (0) or Saturday (6)
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    if (isBusinessDay(result)) {
      addedDays++
    }
  }

  return result
}
