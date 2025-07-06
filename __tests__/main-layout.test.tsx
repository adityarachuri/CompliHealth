import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare it

// Mock next/navigation
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/dashboard",
}))

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

// Mock auth context
jest.mock("@/contexts/auth-context")
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockSignOut = jest.fn()

const mockCustomerUser = {
  id: "customer-1",
  email: "customer@test.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1-555-0123",
  dateOfBirth: "1990-01-01",
  role: "customer" as const,
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
}

const mockHospitalUser = {
  id: "hospital-1",
  email: "hospital@test.com",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  phone: "+1-555-0124",
  dateOfBirth: "1985-05-15",
  role: "hospital" as const,
  organization: "City General Hospital",
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
}

describe("MainLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockCustomerUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })
  })

  it("renders main layout correctly", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    expect(screen.getByText("HealthCare Portal")).toBeInTheDocument()
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it("displays navigation items for customer", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Claims")).toBeInTheDocument()
    expect(screen.getByText("Policies")).toBeInTheDocument()
    expect(screen.getByText("Providers")).toBeInTheDocument()
    expect(screen.getByText("Coverage")).toBeInTheDocument()
    expect(screen.getByText("Analytics")).toBeInTheDocument()
  })

  it("filters navigation based on user role", () => {
    mockUseAuth.mockReturnValue({
      user: mockHospitalUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Providers")).toBeInTheDocument()
    expect(screen.getByText("Analytics")).toBeInTheDocument()

    // Hospital users shouldn't see Claims, Policies, or Coverage
    expect(screen.queryByText("Claims")).not.toBeInTheDocument()
    expect(screen.queryByText("Policies")).not.toBeInTheDocument()
    expect(screen.queryByText("Coverage")).not.toBeInTheDocument()
  })

  it("displays user information in dropdown", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Click on user avatar to open dropdown
    const avatarButton = screen.getByRole("button", { name: /John/i })
    fireEvent.click(avatarButton)

    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("customer@test.com")).toBeInTheDocument()
    expect(screen.getByText("customer")).toBeInTheDocument()
  })

  it("shows organization for non-customer users", () => {
    mockUseAuth.mockReturnValue({
      user: mockHospitalUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Click on user avatar to open dropdown
    const avatarButton = screen.getByRole("button", { name: /Dr. Sarah/i })
    fireEvent.click(avatarButton)

    expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
    expect(screen.getByText("hospital@test.com")).toBeInTheDocument()
    expect(screen.getByText("hospital • City General Hospital")).toBeInTheDocument()
  })

  it("handles sign out correctly", async () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Click on user avatar to open dropdown
    const avatarButton = screen.getByRole("button", { name: /John/i })
    fireEvent.click(avatarButton)

    // Click sign out
    const signOutButton = screen.getByText("Log out")
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it("displays search input", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
  })

  it("shows theme toggle button", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    const themeButton = screen.getByRole("button", { name: /toggle theme/i })
    expect(themeButton).toBeInTheDocument()
  })

  it("displays notification bell", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    const notificationButton = screen.getByRole("button", { name: /notifications/i })
    expect(notificationButton).toBeInTheDocument()
  })

  it("shows mobile menu button on small screens", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // The mobile menu button should be present (though may be hidden by CSS)
    const mobileMenuButtons = screen.getAllByRole("button")
    const menuButton = mobileMenuButtons.find(
      (button) => button.querySelector("svg") && button.className.includes("md:hidden"),
    )
    expect(menuButton).toBeInTheDocument()
  })

  it("highlights active navigation item", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Dashboard should be active (based on mocked pathname)
    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink).toHaveClass("bg-primary")
  })

  it("handles navigation clicks", async () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    const claimsLink = screen.getByText("Claims")
    fireEvent.click(claimsLink)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/claims")
    })
  })

  it("displays user avatar with initials fallback", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Should show user initials as fallback
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("shows profile and settings menu items", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Click on user avatar to open dropdown
    const avatarButton = screen.getByRole("button", { name: /John/i })
    fireEvent.click(avatarButton)

    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders children content in main area", () => {
    const testContent = <div data-testid="test-content">Custom Content</div>

    render(<MainLayout>{testContent}</MainLayout>)

    expect(screen.getByTestId("test-content")).toBeInTheDocument()
    expect(screen.getByText("Custom Content")).toBeInTheDocument()
  })

  it("handles missing user gracefully", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Should still render the layout
    expect(screen.getByText("HealthCare Portal")).toBeInTheDocument()
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it("shows loading state when user is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    )

    // Should still render the layout even during loading
    expect(screen.getByText("HealthCare Portal")).toBeInTheDocument()
  })
})
