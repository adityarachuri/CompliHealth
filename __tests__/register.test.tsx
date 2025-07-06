import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import RegisterPage from "@/app/register/page"
import { useAuth } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare it

// Mock next/navigation
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock auth context
jest.mock("@/contexts/auth-context")
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock auth utils
jest.mock("@/lib/auth-utils", () => ({
  validatePassword: jest.fn((password: string) => ({
    isValid:
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    errors: password.length < 8 ? ["Password must be at least 8 characters long"] : [],
  })),
}))

const mockSignUp = jest.fn()

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: mockSignUp,
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })
  })

  it("renders registration page correctly", () => {
    render(<RegisterPage />)

    expect(screen.getByText("Create Your Account")).toBeInTheDocument()
    expect(
      screen.getByText("Join the Health Insurance Portal and manage your healthcare with ease"),
    ).toBeInTheDocument()
  })

  it("displays all form sections", () => {
    render(<RegisterPage />)

    expect(screen.getByText("Personal Information")).toBeInTheDocument()
    expect(screen.getByText("Account Type")).toBeInTheDocument()
    expect(screen.getByText("Security")).toBeInTheDocument()
    expect(screen.getByText("Terms & Privacy")).toBeInTheDocument()
  })

  it("shows all required form fields", () => {
    render(<RegisterPage />)

    expect(screen.getByLabelText("First Name *")).toBeInTheDocument()
    expect(screen.getByLabelText("Last Name *")).toBeInTheDocument()
    expect(screen.getByLabelText("Email Address *")).toBeInTheDocument()
    expect(screen.getByLabelText("Phone Number *")).toBeInTheDocument()
    expect(screen.getByLabelText("Date of Birth *")).toBeInTheDocument()
    expect(screen.getByLabelText("Password *")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirm Password *")).toBeInTheDocument()
  })

  it("displays role selection dropdown", () => {
    render(<RegisterPage />)

    expect(screen.getByText("I am a *")).toBeInTheDocument()
    expect(screen.getByText("Select your role")).toBeInTheDocument()
  })

  it("shows organization field when non-customer role is selected", async () => {
    render(<RegisterPage />)

    const roleSelect = screen.getByText("Select your role")
    fireEvent.click(roleSelect)

    await waitFor(() => {
      const hospitalOption = screen.getByText("Healthcare Provider")
      fireEvent.click(hospitalOption)
    })

    expect(screen.getByLabelText("Organization Name *")).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<RegisterPage />)

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("First name is required")).toBeInTheDocument()
      expect(screen.getByText("Last name is required")).toBeInTheDocument()
      expect(screen.getByText("Email is required")).toBeInTheDocument()
      expect(screen.getByText("Password is required")).toBeInTheDocument()
    })
  })

  it("validates email format", async () => {
    render(<RegisterPage />)

    const emailInput = screen.getByLabelText("Email Address *")
    fireEvent.change(emailInput, { target: { value: "invalid-email" } })

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()
    })
  })

  it("validates password strength", async () => {
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText("Password *")
    fireEvent.change(passwordInput, { target: { value: "weak" } })

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters long")).toBeInTheDocument()
    })
  })

  it("validates password confirmation", async () => {
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText("Password *")
    const confirmPasswordInput = screen.getByLabelText("Confirm Password *")

    fireEvent.change(passwordInput, { target: { value: "Password123!" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPassword123!" } })

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    })
  })

  it("validates phone number format", async () => {
    render(<RegisterPage />)

    const phoneInput = screen.getByLabelText("Phone Number *")
    fireEvent.change(phoneInput, { target: { value: "123" } })

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid phone number")).toBeInTheDocument()
    })
  })

  it("validates age requirement", async () => {
    render(<RegisterPage />)

    const dobInput = screen.getByLabelText("Date of Birth *")
    const today = new Date()
    const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
    fireEvent.change(dobInput, { target: { value: underageDate.toISOString().split("T")[0] } })

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("You must be at least 18 years old")).toBeInTheDocument()
    })
  })

  it("requires terms and privacy acceptance", async () => {
    render(<RegisterPage />)

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("You must accept the terms and conditions")).toBeInTheDocument()
      expect(screen.getByText("You must accept the privacy policy")).toBeInTheDocument()
    })
  })

  it("toggles password visibility", () => {
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText("Password *")
    const toggleButtons = screen.getAllByRole("button", { name: /toggle password visibility/i })

    expect(passwordInput).toHaveAttribute("type", "password")

    fireEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute("type", "text")

    fireEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("submits form with valid data", async () => {
    mockSignUp.mockResolvedValue({ error: undefined })

    render(<RegisterPage />)

    // Fill out all required fields
    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Email Address *"), { target: { value: "john@example.com" } })
    fireEvent.change(screen.getByLabelText("Phone Number *"), { target: { value: "+1-555-0123" } })
    fireEvent.change(screen.getByLabelText("Date of Birth *"), { target: { value: "1990-01-01" } })
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "Password123!" } })
    fireEvent.change(screen.getByLabelText("Confirm Password *"), { target: { value: "Password123!" } })

    // Accept terms
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))
    fireEvent.click(screen.getByLabelText(/I agree to the Privacy Policy/))

    const submitButton = screen.getByText("Create Account")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith("john@example.com", "Password123!", {
        first_name: "John",
        last_name: "Doe",
        phone: "+1-555-0123",
        date_of_birth: "1990-01-01",
        role: "customer",
        organization: null,
      })
    })
  })

  it("displays success screen after registration", async () => {
    mockSignUp.mockResolvedValue({ error: undefined })

    render(<RegisterPage />)

    // Fill out form and submit
    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Email Address *"), { target: { value: "john@example.com" } })
    fireEvent.change(screen.getByLabelText("Phone Number *"), { target: { value: "+1-555-0123" } })
    fireEvent.change(screen.getByLabelText("Date of Birth *"), { target: { value: "1990-01-01" } })
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "Password123!" } })
    fireEvent.change(screen.getByLabelText("Confirm Password *"), { target: { value: "Password123!" } })
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))
    fireEvent.click(screen.getByLabelText(/I agree to the Privacy Policy/))

    fireEvent.click(screen.getByText("Create Account"))

    await waitFor(() => {
      expect(screen.getByText("Registration Successful!")).toBeInTheDocument()
      expect(screen.getByText(/We've sent a verification email to john@example.com/)).toBeInTheDocument()
    })
  })

  it("handles registration errors", async () => {
    mockSignUp.mockResolvedValue({ error: "Email already exists" })

    render(<RegisterPage />)

    // Fill out form and submit
    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Email Address *"), { target: { value: "john@example.com" } })
    fireEvent.change(screen.getByLabelText("Phone Number *"), { target: { value: "+1-555-0123" } })
    fireEvent.change(screen.getByLabelText("Date of Birth *"), { target: { value: "1990-01-01" } })
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "Password123!" } })
    fireEvent.change(screen.getByLabelText("Confirm Password *"), { target: { value: "Password123!" } })
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))
    fireEvent.click(screen.getByLabelText(/I agree to the Privacy Policy/))

    fireEvent.click(screen.getByText("Create Account"))

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument()
    })
  })

  it("shows loading state during submission", async () => {
    mockSignUp.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ error: undefined }), 100)))

    render(<RegisterPage />)

    // Fill out form
    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Email Address *"), { target: { value: "john@example.com" } })
    fireEvent.change(screen.getByLabelText("Phone Number *"), { target: { value: "+1-555-0123" } })
    fireEvent.change(screen.getByLabelText("Date of Birth *"), { target: { value: "1990-01-01" } })
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "Password123!" } })
    fireEvent.change(screen.getByLabelText("Confirm Password *"), { target: { value: "Password123!" } })
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))
    fireEvent.click(screen.getByLabelText(/I agree to the Privacy Policy/))

    fireEvent.click(screen.getByText("Create Account"))

    expect(screen.getByText("Creating Account...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Registration Successful!")).toBeInTheDocument()
    })
  })

  it("clears field errors when user starts typing", async () => {
    render(<RegisterPage />)

    const firstNameInput = screen.getByLabelText("First Name *")
    const submitButton = screen.getByText("Create Account")

    // Trigger validation error
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("First name is required")).toBeInTheDocument()
    })

    // Start typing to clear error
    fireEvent.change(firstNameInput, { target: { value: "J" } })

    await waitFor(() => {
      expect(screen.queryByText("First name is required")).not.toBeInTheDocument()
    })
  })

  it("displays role descriptions", async () => {
    render(<RegisterPage />)

    const roleSelect = screen.getByText("Select your role")
    fireEvent.click(roleSelect)

    await waitFor(() => {
      expect(screen.getByText("Individual seeking health insurance coverage")).toBeInTheDocument()
      expect(screen.getByText("Healthcare provider or medical facility")).toBeInTheDocument()
      expect(screen.getByText("Third Party Administrator")).toBeInTheDocument()
      expect(screen.getByText("Insurance company or provider")).toBeInTheDocument()
    })
  })

  it("displays sign in link", () => {
    render(<RegisterPage />)

    const signInLink = screen.getByText("Sign in here")
    expect(signInLink).toBeInTheDocument()
    expect(signInLink.closest("a")).toHaveAttribute("href", "/login")
  })
})
