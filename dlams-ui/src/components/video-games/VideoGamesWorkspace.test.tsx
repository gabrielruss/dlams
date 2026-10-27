import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"
import type { CollectionAccess } from "@/types"

const api = "http://localhost/api"

function signInWithCollection(access: CollectionAccess) {
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: "2", username: "test-user", role: "user" },
      })
    ),
    http.get(`${api}/collections`, () =>
      HttpResponse.json({
        collections: [
          {
            id: 1,
            owner_id: 1,
            name: "Retro game shelf",
            type: "video_game",
            access,
          },
        ],
      })
    ),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({
        stats: [{ collection_id: 1, game_count: 1, console_count: 1 }],
      })
    ),
    http.get(`${api}/collections/1/consoles`, () =>
      HttpResponse.json({
        consoles: [
          {
            id: 1,
            console_label_id: 1,
            label: "Xbox 360",
            edition: "Original White",
            condition: "CIB",
            game_count: 1,
          },
        ],
      })
    ),
    http.get(`${api}/collections/1/games`, () =>
      HttpResponse.json({
        games: [
          {
            id: 1,
            name: "Halo 3",
            condition: "CIB",
            console_label_id: 1,
            console_label: "Xbox 360",
            last_played: null,
            completed: false,
          },
        ],
      })
    ),
    http.get(`${api}/console-labels`, () =>
      HttpResponse.json({ labels: [] })
    )
  )
}

describe("video game collection access", () => {
  it("lets an owner add, edit, and delete", async () => {
    signInWithCollection("owner")

    renderApp("/")

    expect(await screen.findByText("Halo 3")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "New collection" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add console" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add game" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Edit Halo 3" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Delete Halo 3" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Edit Xbox 360 — Original White" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Delete Xbox 360 — Original White" })
    ).toBeInTheDocument()
    expect(screen.getByText("CIB · 1 game")).toBeInTheDocument()
  })

  it("shows a shared collection to read without any write controls", async () => {
    signInWithCollection("view-only")

    renderApp("/")

    expect(await screen.findByText("Halo 3")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Add console" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Add game" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Edit/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Delete/ })
    ).not.toBeInTheDocument()
  })

  it("has no accessibility violations on the collection view", async () => {
    signInWithCollection("owner")

    const { container } = renderApp("/")
    await screen.findByText("Halo 3")

    await expectNoViolations(container)
  })

  it.each(["New collection", "Add console", "Add game", "Open menu"])(
    "has no accessibility violations with the %s drawer open",
    async (buttonName) => {
      signInWithCollection("owner")

      const { user } = renderApp("/")
      await screen.findByText("Halo 3")
      await user.click(screen.getAllByRole("button", { name: buttonName })[0])
      await screen.findByRole("dialog")

      await expectNoViolations(document.body)
    }
  )
})
