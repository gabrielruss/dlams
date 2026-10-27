import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"

const api = "http://localhost/api"

function signInAsAdmin() {
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: "1", username: "admin", role: "admin" },
      })
    ),
    http.get(`${api}/admin/users`, () =>
      HttpResponse.json({
        users: [
          {
            id: 1,
            username: "admin",
            role: "admin",
            is_active: true,
            created_at: "2026-10-01T12:00:00Z",
          },
          {
            id: 2,
            username: "demo-user",
            role: "user",
            is_active: true,
            created_at: "2026-10-17T12:00:00Z",
          },
        ],
      })
    )
  )
}

describe("user management", () => {
  it("lists users for an admin with no accessibility violations", async () => {
    signInAsAdmin()

    const { container } = renderApp("/admin/users")

    expect(await screen.findByText("demo-user")).toBeInTheDocument()
    await expectNoViolations(container)
  })

  it("has no accessibility violations with the invite drawer open", async () => {
    signInAsAdmin()

    const { user } = renderApp("/admin/users")
    await screen.findByText("demo-user")
    await user.click(screen.getAllByRole("button", { name: /invite/i })[0])
    await screen.findByRole("dialog")

    await expectNoViolations(document.body)
  })
})
