import { render, screen } from "@testing-library/react"
import { useRouter, useSearchParams } from "next/navigation"
import ResetPasswordPage from "@/app/reset-password/page"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Next.js router and search params
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    mockPush.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Token Validation", () => {
    it("shows loading state while validating token", () => {
      mockSearchParams.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === "token") return "valid-token-123456789012345678901234567890ab"
          if (key === "email") return "test@example.com"
          return null
        }),
      } as any)

      render(<ResetPasswordPage />)

      expect(screen.getByText("Validating reset token...")).toBeInTheDocument()
    })
  })
})
