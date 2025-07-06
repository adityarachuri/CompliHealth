import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import ForgotPasswordPage from "@/app/forgot-password/page"
import jest from "jest" // Import jest to declare it

// Mock the dependencies
jest.mock("next/navigation")
jest.mock("@/lib/email-service")

const mockPush = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  })
})

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render forgot password form", () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText("Send Reset Link")).toBeInTheDocument()
  })

  it("should validate email input", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByText("Send Reset Link")

    // Try to submit without email
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Try with invalid email
    await user.type(emailInput, "invalid-email")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it("should handle form submission", async () => {
    const user = userEvent.setup()
    const { sendPasswordResetEmail } = require("@/lib/email-service")
    sendPasswordResetEmail.mockResolvedValue({ success: true })

    render(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByText("Send Reset Link")

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith("test@example.com")
    })
  })

  it("should show success message", async () => {
    const user = userEvent.setup()
    const { sendPasswordResetEmail } = require("@/lib/email-service")
    sendPasswordResetEmail.mockResolvedValue({ success: true })

    render(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByText("Send Reset Link")

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it("should handle submission error", async () => {
    const user = userEvent.setup()
    const { sendPasswordResetEmail } = require("@/lib/email-service")
    sendPasswordResetEmail.mockRejectedValue(new Error("Email not found"))

    render(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByText("Send Reset Link")

    await user.type(emailInput, "notfound@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument()
    })
  })

  it("should show loading state during submission", async () => {
    const user = userEvent.setup()
    const { sendPasswordResetEmail } = require("@/lib/email-service")
    sendPasswordResetEmail.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

    render(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByText("Send Reset Link")

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    expect(screen.getByText(/sending/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it("should have link back to login", () => {
    render(<ForgotPasswordPage />)

    const loginLink = screen.getByText("Back to Login")
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login")
  })
})
