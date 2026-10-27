import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"

const api = "http://localhost/api"

describe("registering", () => {
  it("is a page with a main landmark and no accessibility violations", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 })
      )
    )

    const { container } = renderApp("/register")

    expect(await screen.findByRole("main")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Create account" })
    ).toBeInTheDocument()
    await expectNoViolations(container)
  })
})
