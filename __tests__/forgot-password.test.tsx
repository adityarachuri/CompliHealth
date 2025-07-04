import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import ForgotPasswordPage from "@/app/forgot-password/page"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe("ForgotPasswordPage", () => {
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

  describe("Initial Render", () => {
    it("renders forgot password form with all elements", () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByText("Forgot Password?")).toBeInTheDocument()
      expect(
        screen.getByText("Enter your email address and we'll send you instructions to reset your password"),
      ).toBeInTheDocument()
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Send Reset Instructions" })).toBeInTheDocument()
      expect(screen.getByText("Back to Sign In")).toBeInTheDocument()
      expect(screen.getByText("Demo Mode")).toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("enables submit button when email is entered", async () => {
      const user = userEvent.setup()
      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText("Email Address")
      const submitButton = screen.getByRole("button", { name: "Send Reset Instructions" })

      expect(submitButton).toBeDisabled()

      await user.type(emailInput, "test@example.com")
      expect(submitButton).toBeEnabled()
    })
  })
})
