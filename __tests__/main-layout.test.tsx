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
const mockPush = jest.fn()

const authState: { user: typeof mockUser | null; loading: boolean } = {
  user: mockUser,
  loading: false,
}

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: authState.user,
    signOut: mockSignOut,
    loading: authState.loading,
  }),
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard",
}))

describe("MainLayout", () => {
  beforeEach(() => {
    mockSignOut.mockClear()
    mockPush.mockClear()
    authState.user = mockUser
    authState.loading = false
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

  it("should show a loading state while auth is resolving", () => {
    authState.loading = true

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getByText("Loading CompliHealth...")).toBeInTheDocument()
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument()
  })

  it("should redirect to login and render nothing when there is no authenticated user", () => {
    authState.user = null
    authState.loading = false

    const { container } = render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(container).toBeEmptyDOMElement()
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("should show the Analytics nav item for insurer and tpa roles", () => {
    authState.user = { ...mockUser, role: "insurer" }

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getByText("Analytics")).toBeInTheDocument()
    expect(screen.queryByText("Coverage")).not.toBeInTheDocument()
  })

  it("should log an error when sign out fails", async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignOut.mockRejectedValueOnce(new Error("network down"))

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

    expect(consoleErrorSpy).toHaveBeenCalledWith("CompliHealth - Sign out error:", expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  it("should fall back to '?' initials when the user has no name", () => {
    authState.user = { ...mockUser, name: "" }

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getAllByText("?").length).toBeGreaterThan(0)
  })

  it("should fall back to the raw role string for an unrecognized role", () => {
    authState.user = { ...mockUser, role: "auditor" as typeof mockUser.role }

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getAllByText("auditor").length).toBeGreaterThan(0)
  })

  it("should close the mobile menu when a navigation link is clicked", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
    fireEvent.click(menuButton)
    expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument()

    const dashboardLinks = screen.getAllByText("Dashboard")
    fireEvent.click(dashboardLinks[dashboardLinks.length - 1])

    expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument()
  })
})
