import { screen, within } from "@testing-library/react"

/** Provider cards render in sort order, not data order, so look up a card's
 * controls by matching its heading text rather than relying on index.
 * Matched by tag (<h3>, the card title) rather than role, because once a
 * dialog is open Radix marks the rest of the page aria-hidden, which would
 * hide the list's headings from role-based queries; and matched by tag
 * rather than plain text, because an open dialog's own title repeats the
 * same provider name. */
export function getProviderCard(providerName: string): HTMLElement {
  const heading = screen.getAllByText(providerName).find((el) => el.tagName === "H3")
  const card = heading?.closest(".rounded-lg")
  if (!card) throw new Error(`No provider card found for "${providerName}"`)
  return card as HTMLElement
}

export function getViewDetailsButtonFor(providerName: string): HTMLElement {
  return within(getProviderCard(providerName)).getByText("View Details")
}

export function getBookAppointmentButtonFor(providerName: string): HTMLElement {
  return within(getProviderCard(providerName)).getByText("Book Appointment")
}
