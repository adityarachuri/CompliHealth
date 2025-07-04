import { render, screen } from "@testing-library/react"
import { useRouter } from "next/navigation"
import LoginPage from "@/app/login/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe("Login Page Integration", () => {
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
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("renders login page with forgot password link", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    expect(screen.getByText("Healthcare Insurance Portal")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByText("Forgot password?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
  })

  it("has working forgot password link", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    const forgotPasswordLink = screen.getByText("Forgot password?")
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "/forgot-password")
  })
})
