import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginPage from "@/app/login/page"
import { AuthProvider } from "@/contexts/auth-context"

const push = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/login",
}))

describe("Login Page", () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  it("renders the demo accounts and the sign-in form", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByText("customer@demo.com")).toBeInTheDocument()
    expect(screen.getByText("hospital@demo.com")).toBeInTheDocument()
  })

  it("fills the form when a demo account is selected", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.click(screen.getByText("customer@demo.com"))

    expect(screen.getByLabelText("Email Address")).toHaveValue("customer@demo.com")
    expect(screen.getByLabelText("Password")).toHaveValue("demo123")
  })

  it("toggles password visibility", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement
    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(passwordInput).toHaveAttribute("type", "text")
  })

  it("signs in with a valid demo account and redirects to the dashboard", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.click(screen.getByText("customer@demo.com"))
    await user.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("shows an error for an invalid password", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.type(screen.getByLabelText("Email Address"), "customer@demo.com")
    await user.type(screen.getByLabelText("Password"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByText(/invalid password/i)).toBeInTheDocument()
    })
    expect(push).not.toHaveBeenCalled()
  })
})
