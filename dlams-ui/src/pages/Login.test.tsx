import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { afterEach, describe, expect, it, vi } from "vitest"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"

const api = "http://localhost/api"

describe("signing in", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

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

  it("signs a visitor into the read-only demo with one click", async () => {
    vi.stubEnv("VITE_DEMO_USERNAME", "demo-user")
    vi.stubEnv("VITE_DEMO_PASSWORD", "demo-password")
    server.use(
      http.get(`${api}/verify`, () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
      http.post(`${api}/login`, () =>
        HttpResponse.json({
          user: { id: "1", username: "demo-user", role: "demo" },
        }),
      ),
      http.get(`${api}/collections`, () =>
        HttpResponse.json({
          collections: [
            {
              id: 1,
              owner_id: 1,
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
        HttpResponse.json({ console_labels: [] }),
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
      screen.queryByRole("button", { name: "New collection" }),
    ).not.toBeInTheDocument()
  })
})
