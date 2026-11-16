import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"

const api = "http://localhost/api"

function shareCollection() {
  server.use(
    http.get(`${api}/shared/token-1`, () =>
      HttpResponse.json({
        name: "Retro game shelf",
        type: "video_game",
        consoles: [
          {
            id: 1,
            console_label_id: 1,
            label: "Xbox 360",
            edition: "Original White",
            condition: "CIB",
          },
        ],
        games: [
          {
            id: 1,
            name: "Halo 3",
            condition: "CIB",
            console_label_id: 1,
            console_label: "Xbox 360",
            last_played: null,
            completed: true,
          },
          {
            id: 2,
            name: "Pokémon Red",
            condition: "Loose",
            console_label_id: 2,
            console_label: "Game Boy",
            last_played: null,
            completed: false,
          },
        ],
      }),
    ),
  )
}

describe("the shared collection page", () => {
  it("shows the collection read-only without signing in", async () => {
    shareCollection()

    renderApp("/s/token-1")

    expect(
      await screen.findByRole("heading", { name: "Retro game shelf" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Halo 3")).toBeInTheDocument()
    expect(screen.getByText("Xbox 360 — Original White")).toBeInTheDocument()
    expect(screen.getByText(/This view is read-only/)).toBeInTheDocument()
    expect(screen.getByText("Video games")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^(Add|Edit|Delete|Share)/ }),
    ).not.toBeInTheDocument()
  })

  it("says when a link is no longer active", async () => {
    server.use(
      http.get(`${api}/shared/gone`, () =>
        HttpResponse.json(
          { detail: "This link is no longer active." },
          { status: 404 },
        ),
      ),
    )

    renderApp("/s/gone")

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This link is no longer active.",
    )
  })

  it("narrows its lists as you type, ignoring accents", async () => {
    shareCollection()
    const { user } = renderApp("/s/token-1")
    await screen.findByText("Halo 3")

    await user.type(
      screen.getByRole("searchbox", { name: "Search this collection" }),
      "pokemon",
    )

    expect(screen.getByText("Pokémon Red")).toBeInTheDocument()
    expect(screen.queryByText("Halo 3")).not.toBeInTheDocument()
    expect(screen.getByText("No consoles match.")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 items match")
  })

  it("matches a game by its console", async () => {
    shareCollection()
    const { user } = renderApp("/s/token-1")
    await screen.findByText("Halo 3")

    await user.type(
      screen.getByRole("searchbox", { name: "Search this collection" }),
      "xbox",
    )

    expect(screen.getByText("Halo 3")).toBeInTheDocument()
    expect(screen.getByText("Xbox 360 — Original White")).toBeInTheDocument()
    expect(screen.queryByText("Pokémon Red")).not.toBeInTheDocument()
  })

  it("says when nothing matches, and clears on Escape", async () => {
    shareCollection()
    const { user } = renderApp("/s/token-1")
    await screen.findByText("Halo 3")
    const searchBox = screen.getByRole("searchbox", {
      name: "Search this collection",
    })

    await user.type(searchBox, "zelda")
    expect(screen.getByRole("status")).toHaveTextContent(
      'Nothing matches "zelda".',
    )
    expect(screen.getByText("No games match.")).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(searchBox).toHaveValue("")
    expect(screen.getByText("Halo 3")).toBeInTheDocument()
    expect(screen.getByText("Pokémon Red")).toBeInTheDocument()
  })

  it("has no accessibility violations", async () => {
    shareCollection()

    const { container } = renderApp("/s/token-1")
    await screen.findByText("Halo 3")

    await expectNoViolations(container)
  })
})
