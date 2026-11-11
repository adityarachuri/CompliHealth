import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthProvider } from "@/contexts/auth-context"

const mockUser = {
  id: "123",
  email: "test@example.com",
  name: "Test User",
  role: "customer",
  organization: "Personal Account",
}

const mockSignOut = jest.fn()

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
    loading: false,
  }),
}))

describe("MainLayout", () => {
  beforeEach(() => {
    mockSignOut.mockClear()
  })

  it("should render navigation for customer role", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Policies")).toBeInTheDocument()
    expect(screen.getByText("Claims")).toBeInTheDocument()
    expect(screen.getByText("Providers")).toBeInTheDocument()
    expect(screen.getByText("Coverage")).toBeInTheDocument()
  })

  it("should toggle mobile sidebar", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument()

    const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
    fireEvent.click(menuButton)

    expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument()
  })

  it("should display user name in header", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getAllByText("Test User").length).toBeGreaterThan(0)
  })

  it("should handle sign out", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    const avatarTrigger = screen.getAllByRole("button").find((btn) => btn.className.includes("rounded-full"))
    await user.click(avatarTrigger!)

    const signOutButton = await screen.findByText("Sign out")
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })
})
