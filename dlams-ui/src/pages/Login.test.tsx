import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"

const api = "http://localhost/api"

describe("signing in", () => {
  it("shows the API's message when the credentials are wrong", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
      http.post(`${api}/login`, () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 }),
      ),
    )

    const { user } = renderApp("/")

    await user.type(await screen.findByLabelText("Username"), "admin")
    await user.type(screen.getByLabelText("Password"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    )
  })

  it("starts a demo session with one click", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
      http.post(`${api}/demo-sessions`, () =>
        HttpResponse.json(
          { user: { id: "9", username: "sandbox-3f9a1c2e", role: "sandbox" } },
          { status: 201 },
        ),
      ),
      http.get(`${api}/collections`, () =>
        HttpResponse.json({
          collections: [
            {
              id: 1,
              owner_id: 9,
              name: "Retro game shelf",
              type: "video_game",
              access: "owner",
            },
          ],
        }),
      ),
      http.get(`${api}/collections/video-game-stats`, () =>
        HttpResponse.json({
          stats: [{ collection_id: 1, game_count: 0, console_count: 0 }],
        }),
      ),
      http.get(`${api}/collections/1/consoles`, () =>
        HttpResponse.json({ consoles: [] }),
      ),
      http.get(`${api}/collections/1/games`, () =>
        HttpResponse.json({ games: [] }),
      ),
      http.get(`${api}/console-labels`, () =>
        HttpResponse.json({ labels: [] }),
      ),
    )

    const { user } = renderApp("/")

    await user.click(
      await screen.findByRole("button", { name: "Try the demo" }),
    )

    expect(
      await screen.findByRole("heading", { name: "Retro game shelf" }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/Demo session: it ends after 30 minutes/),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add game" })).toBeInTheDocument()
  })

  it("shows the API's message when the demo is busy", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
      http.post(`${api}/demo-sessions`, () =>
        HttpResponse.json(
          { detail: "The demo is busy. Try again in a few minutes." },
          { status: 503 },
        ),
      ),
    )

    const { user } = renderApp("/")

    await user.click(
      await screen.findByRole("button", { name: "Try the demo" }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The demo is busy. Try again in a few minutes.",
    )
  })

  it("is a page with a main landmark and a level 1 heading", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 })
      )
    )

    renderApp("/")

    expect(await screen.findByRole("main")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Login" })
    ).toBeInTheDocument()
  })

  it("has no accessibility violations on the login page", async () => {
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 })
      )
    )

    const { container } = renderApp("/")
    await screen.findByLabelText("Username")

    await expectNoViolations(container)
  })
})
