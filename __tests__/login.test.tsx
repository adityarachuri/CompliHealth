import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import Login from "@/app/login/page"
import jest from "jest"

const mockAuthContext = {
  user: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  loading: false,
  updateProfile: jest.fn(),
}

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe("Login", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders login form correctly", async () => {
    render(<Login />)

    expect(screen.getByText("Sign In")).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("displays demo login section", async () => {
    render(<Login />)

    expect(screen.getByText("Demo Accounts")).toBeInTheDocument()
    expect(screen.getByText("Customer Demo")).toBeInTheDocument()
    expect(screen.getByText("Hospital Demo")).toBeInTheDocument()
  })

  it("validates email field", async () => {
    render(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "invalid-email")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()
    })
  })

  it("validates password field", async () => {
    render(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument()
    })
  })

  it("handles demo login for customer", async () => {
    render(<Login />)

    const customerDemoButton = screen.getByText("Customer Demo")
    await user.click(customerDemoButton)

    expect(mockAuthContext.signIn).toHaveBeenCalledWith("customer@demo.com", "demo123")
  })

  it("handles demo login for hospital", async () => {
    render(<Login />)

    const hospitalDemoButton = screen.getByText("Hospital Demo")
    await user.click(hospitalDemoButton)

    expect(mockAuthContext.signIn).toHaveBeenCalledWith("hospital@demo.com", "demo123")
  })

  it("toggles password visibility", async () => {
    render(<Login />)

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole("button", { name: /toggle password visibility/i })

    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")
  })

  it("displays loading state during authentication", async () => {
    const loadingContext = { ...mockAuthContext, loading: true }
    jest.mocked(require("@/contexts/auth-context").useAuth).mockReturnValue(loadingContext)

    render(<Login />)

    expect(screen.getByText("Signing in...")).toBeInTheDocument()
  })

  it("handles form submission with valid credentials", async () => {
    render(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "password123")
    await user.click(submitButton)

    expect(mockAuthContext.signIn).toHaveBeenCalledWith("test@example.com", "password123")
  })

  it("displays forgot password link", async () => {
    render(<Login />)

    expect(screen.getByText("Forgot your password?")).toBeInTheDocument()
  })

  it("displays sign up link", async () => {
    render(<Login />)

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText("Sign up")).toBeInTheDocument()
  })

  it("handles authentication errors", async () => {
    const errorContext = {
      ...mockAuthContext,
      signIn: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
    }
    jest.mocked(require("@/contexts/auth-context").useAuth).mockReturnValue(errorContext)

    render(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "wrongpassword")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })
})
