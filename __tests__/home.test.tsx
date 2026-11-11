import { render, screen, waitFor } from "@testing-library/react"
import HomePage from "@/app/page"
import { AuthProvider } from "@/contexts/auth-context"

const push = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Home Page", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows a loading state while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, loading: true })

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading CompliHealth...")).toBeInTheDocument()
  })

  it("redirects authenticated users to the dashboard", async () => {
    useAuth.mockReturnValue({
      user: { id: "1", email: "customer@demo.com", name: "John Smith", role: "customer" },
      loading: false,
    })

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("redirects unauthenticated users to the login page", async () => {
    useAuth.mockReturnValue({ user: null, loading: false })

    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login")
    })
  })
})
