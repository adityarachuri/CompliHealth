import { z } from "zod"

// User schemas
export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,}$/, "Invalid phone number")
    .optional(),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18 && age <= 120
  }, "Must be between 18 and 120 years old"),
  role: z.enum(["customer", "hospital", "tpa", "insurer"]),
  organization: z.string().max(100, "Organization name too long").optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "Must accept terms and conditions"),
  acceptPrivacy: z.boolean().refine((val) => val === true, "Must accept privacy policy"),
})

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,}$/, "Invalid phone number")
    .optional(),
  dateOfBirth: z.string().optional(),
  organization: z.string().max(100, "Organization name too long").optional(),
  preferences: z.record(z.any()).optional(),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Policy schemas
export const policySchema = z
  .object({
    policyNumber: z.string().min(1, "Policy number is required"),
    policyType: z.string().min(1, "Policy type is required"),
    premiumAmount: z.number().positive("Premium amount must be positive"),
    coverageAmount: z.number().positive("Coverage amount must be positive"),
    startDate: z.string().refine((date) => new Date(date) > new Date(), "Start date must be in the future"),
    endDate: z.string(),
    deductible: z.number().min(0, "Deductible cannot be negative"),
    copay: z.number().min(0, "Copay cannot be negative"),
    outOfPocketMax: z.number().positive("Out of pocket max must be positive"),
    networkType: z.enum(["HMO", "PPO", "EPO", "POS"]),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })

// Claim schemas
export const claimSubmissionSchema = z.object({
  policyId: z.string().uuid("Invalid policy ID"),
  providerId: z.string().uuid("Invalid provider ID"),
  diagnosis: z.string().min(1, "Diagnosis is required").max(500, "Diagnosis too long"),
  treatmentDetails: z.string().min(1, "Treatment details are required").max(1000, "Treatment details too long"),
  claimAmount: z.number().positive("Claim amount must be positive").max(1000000, "Claim amount too high"),
  serviceDate: z.string().refine((date) => new Date(date) <= new Date(), "Service date cannot be in the future"),
  attachments: z.array(z.string()).optional(),
  emergencyService: z.boolean().default(false),
})

export const claimProcessingSchema = z.object({
  claimId: z.string().uuid("Invalid claim ID"),
  status: z.enum(["approved", "rejected", "pending_info"]),
  approvedAmount: z.number().min(0, "Approved amount cannot be negative").optional(),
  rejectionReason: z.string().max(500, "Rejection reason too long").optional(),
  processorNotes: z.string().max(1000, "Processor notes too long").optional(),
})

// Provider schemas
export const providerRegistrationSchema = z.object({
  name: z.string().min(1, "Provider name is required").max(100, "Provider name too long"),
  type: z.enum(["Hospital", "Clinic", "Specialist", "Urgent Care", "Dental", "Pharmacy"]),
  specialty: z.string().min(1, "Specialty is required").max(100, "Specialty too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  phone: z.string().regex(/^\+?[\d\s\-()]{10,}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional(),
  licenseNumber: z.string().min(1, "License number is required"),
  networkStatus: z.enum(["In-Network", "Out-of-Network"]),
  services: z.array(z.string()).min(1, "At least one service is required"),
  acceptedInsurance: z.array(z.string()).min(1, "At least one insurance type is required"),
})

// Analytics schemas
export const analyticsQuerySchema = z
  .object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
    metrics: z.array(z.string()).min(1, "At least one metric is required"),
    filters: z.record(z.any()).optional(),
    groupBy: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  })

// File upload schemas
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive").max(10485760, "File too large (max 10MB)"),
  fileType: z
    .string()
    .refine(
      (type) => ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/csv"].includes(type),
      "Unsupported file type",
    ),
  category: z.enum(["claim_document", "policy_document", "profile_image", "report"]),
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string(),
  requestId: z.string().uuid(),
})

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Validation helper functions
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validatePartialSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: Partial<T> } | { success: false; errors: string[] } {
  return validateSchema(schema.partial(), data)
}
