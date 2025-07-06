import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import LoginPage from "@/app/login/page"
import { useAuth } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the dependencies
jest.mock("next/navigation")
jest.mock("@/contexts/auth-context")

const mockPush = jest.fn()
const mockLogin = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  })
  ;(useAuth as jest.Mock).mockReturnValue({
    login: mockLogin,
    user: null,
    loading: false,
  })
})

describe("LoginPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should handle complete login flow", async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(<LoginPage />)

    // Fill out login form
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")

    // Submit form
    const loginButton = screen.getByText("Sign In")
    await user.click(loginButton)

    // Should call login function
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")
    })
  })

  it("should handle demo account functionality", async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(<LoginPage />)

    // Click demo login button
    const demoButton = screen.getByText("Try Demo Account")
    await user.click(demoButton)

    // Should call login with demo credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("demo@healthinsurance.com", "demo123")
    })
  })

  it("should navigate to forgot password", async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const forgotPasswordLink = screen.getByText("Forgot your password?")
    await user.click(forgotPasswordLink)

    expect(mockPush).toHaveBeenCalledWith("/forgot-password")
  })

  it("should navigate to registration", async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const registerLink = screen.getByText("Sign up")
    await user.click(registerLink)

    expect(mockPush).toHaveBeenCalledWith("/register")
  })

  it("should handle login errors", async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error("Invalid credentials"))

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")

    const loginButton = screen.getByText("Sign In")
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it("should show loading state during login", async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")

    const loginButton = screen.getByText("Sign In")
    await user.click(loginButton)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(loginButton).toBeDisabled()
  })

  it("should persist session after successful login", async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: { email: "test@example.com", role: "customer" },
      loading: false,
    })

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")

    const loginButton = screen.getByText("Sign In")
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })
})
