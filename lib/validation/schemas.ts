import { z } from "zod"

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-$$$$]+$/)
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  role: z.enum(["customer", "hospital", "tpa", "insurer", "admin"]),
  organization: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  emailVerified: true,
})

export const updateUserSchema = createUserSchema.partial()

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number")
      .optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
      .optional(),
    role: z.enum(["customer", "hospital", "tpa", "insurer"]),
    organization: z.string().max(100).optional(),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
    acceptPrivacy: z.boolean().refine((val) => val === true, "You must accept the privacy policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 18
      }
      return true
    },
    {
      message: "You must be at least 18 years old",
      path: ["dateOfBirth"],
    },
  )
  .refine(
    (data) => {
      if (data.role !== "customer" && !data.organization) {
        return false
      }
      return true
    },
    {
      message: "Organization is required for this role",
      path: ["organization"],
    },
  )

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Claim schemas
export const claimSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  policyId: z.string().uuid(),
  claimNumber: z.string(),
  type: z.enum(["medical", "dental", "vision", "prescription", "emergency"]),
  status: z.enum(["draft", "submitted", "under_review", "approved", "denied", "paid"]),
  amount: z.number().positive(),
  description: z.string().min(1).max(1000),
  dateOfService: z.string().datetime(),
  providerId: z.string().uuid().optional(),
  documents: z.array(z.string()).default([]),
  submittedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
  approvedAmount: z.number().positive().optional(),
  denialReason: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createClaimSchema = claimSchema.omit({
  id: true,
  claimNumber: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  approvedAmount: true,
  denialReason: true,
  createdAt: true,
  updatedAt: true,
})

export const updateClaimSchema = createClaimSchema.partial()

// Policy schemas
export const policySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  policyNumber: z.string(),
  type: z.enum(["individual", "family", "group"]),
  status: z.enum(["active", "inactive", "cancelled", "expired"]),
  premium: z.number().positive(),
  deductible: z.number().min(0),
  coverageLimit: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  beneficiaries: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        dateOfBirth: z.string(),
      }),
    )
    .default([]),
  coverageDetails: z.record(z.any()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createPolicySchema = policySchema.omit({
  id: true,
  policyNumber: true,
  createdAt: true,
  updatedAt: true,
})

export const updatePolicySchema = createPolicySchema.partial()

// Provider schemas
export const providerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(["hospital", "clinic", "pharmacy", "laboratory", "specialist"]),
  specialties: z.array(z.string()).default([]),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US"),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
  networkStatus: z.enum(["in_network", "out_of_network"]),
  rating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createProviderSchema = providerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateProviderSchema = createProviderSchema.partial()

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Type exports
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type Login = z.infer<typeof loginSchema>
export type Register = z.infer<typeof registerSchema>
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>
export type ResetPassword = z.infer<typeof resetPasswordSchema>
export type Claim = z.infer<typeof claimSchema>
export type CreateClaim = z.infer<typeof createClaimSchema>
export type UpdateClaim = z.infer<typeof updateClaimSchema>
export type Policy = z.infer<typeof policySchema>
export type CreatePolicy = z.infer<typeof createPolicySchema>
export type UpdatePolicy = z.infer<typeof updatePolicySchema>
export type Provider = z.infer<typeof providerSchema>
export type CreateProvider = z.infer<typeof createProviderSchema>
export type UpdateProvider = z.infer<typeof updateProviderSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type Pagination = z.infer<typeof paginationSchema>
