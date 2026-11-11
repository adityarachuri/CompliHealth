import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CoveragePage from "@/app/coverage/page"

describe("Coverage Page", () => {
  it("renders plan information and financial tracking", () => {
    render(<CoveragePage />)

    expect(screen.getByRole("heading", { level: 1, name: "Coverage Details" })).toBeInTheDocument()
    expect(screen.getByText("Comprehensive Health Plus")).toBeInTheDocument()
    expect(screen.getByText("MEM123456789")).toBeInTheDocument()

    expect(screen.getByText("Deductible Progress")).toBeInTheDocument()
    expect(screen.getByText("Out-of-Pocket Maximum")).toBeInTheDocument()
    expect(screen.getByText("$850 / $1500")).toBeInTheDocument()
  })

  it("filters coverage details by category", async () => {
    const user = userEvent.setup()

    render(<CoveragePage />)

    expect(screen.getByText("Annual Physical Exam")).toBeInTheDocument()
    expect(screen.getByText("Emergency Room Visit")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Emergency" }))

    expect(screen.queryByText("Annual Physical Exam")).not.toBeInTheDocument()
    expect(screen.getByText("Emergency Room Visit")).toBeInTheDocument()
  })

  it("shows service detail dialog with prior authorization status", async () => {
    const user = userEvent.setup()

    render(<CoveragePage />)

    const mriRow = screen.getByText("MRI/CT Scan").closest(".border-l-blue-500") as HTMLElement
    await user.click(within(mriRow).getByText("Details"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Required")).toBeInTheDocument()
    expect(within(dialog).getByText("Prior authorization required")).toBeInTheDocument()
  })
})
