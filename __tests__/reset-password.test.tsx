import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter, useSearchParams } from "next/navigation"
import ResetPasswordPage from "@/app/reset-password/page"
import jest from "jest" // Import jest to declare it

// Mock the dependencies
jest.mock("next/navigation")
jest.mock("@/lib/auth-utils")

const mockPush = jest.fn()
const mockGet = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  })
  ;(useSearchParams as jest.Mock).mockReturnValue({
    get: mockGet,
  })

  mockGet.mockReturnValue("valid-token")
})

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render reset password form", () => {
    render(<ResetPasswordPage />)

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument()
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText("Reset Password")).toBeInTheDocument()
  })

  it("should validate password strength", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const submitButton = screen.getByText("Reset Password")

    await user.type(passwordInput, "weak")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it("should validate password confirmation", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByText("Reset Password")

    await user.type(passwordInput, "StrongPass123!")
    await user.type(confirmPasswordInput, "DifferentPass123!")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it("should handle successful password reset", async () => {
    const user = userEvent.setup()
    const { resetPassword } = require("@/lib/auth-utils")
    resetPassword.mockResolvedValue({ success: true })

    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByText("Reset Password")

    await user.type(passwordInput, "StrongPass123!")
    await user.type(confirmPasswordInput, "StrongPass123!")
    await user.click(submitButton)

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("valid-token", "StrongPass123!")
    })
  })

  it("should handle invalid token", () => {
    mockGet.mockReturnValue(null)

    render(<ResetPasswordPage />)

    expect(screen.getByText(/invalid or expired reset link/i)).toBeInTheDocument()
  })

  it("should handle reset error", async () => {
    const user = userEvent.setup()
    const { resetPassword } = require("@/lib/auth-utils")
    resetPassword.mockRejectedValue(new Error("Token expired"))

    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByText("Reset Password")

    await user.type(passwordInput, "StrongPass123!")
    await user.type(confirmPasswordInput, "StrongPass123!")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/token expired/i)).toBeInTheDocument()
    })
  })

  it("should toggle password visibility", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const toggleButton = screen.getAllByRole("button", { name: /toggle password visibility/i })[0]

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password")

    // Click toggle to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")
  })

  it("should show loading state during submission", async () => {
    const user = userEvent.setup()
    const { resetPassword } = require("@/lib/auth-utils")
    resetPassword.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

    render(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByText("Reset Password")

    await user.type(passwordInput, "StrongPass123!")
    await user.type(confirmPasswordInput, "StrongPass123!")
    await user.click(submitButton)

    expect(screen.getByText(/resetting password/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
