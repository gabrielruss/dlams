import { screen, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { expectNoViolations } from "@/test/axe"
import { renderApp } from "@/test/renderApp"
import { server } from "@/test/server"
import type { OwnedItem } from "@/types/items"

const api = "http://localhost/api"

const items: OwnedItem[] = [
  {
    type: "game",
    id: 1,
    collection_id: 1,
    collection_name: "Retro game shelf",
    title: "Halo 3",
    keywords: ["Xbox 360"],
    details: ["CIB"],
  },
  {
    type: "game",
    id: 2,
    collection_id: 2,
    collection_name: "Games to sell",
    title: "Pokémon Red",
    keywords: ["Game Boy"],
    details: ["Loose", "Completed"],
  },
  {
    type: "console",
    id: 1,
    collection_id: 1,
    collection_name: "Retro game shelf",
    title: "Xbox 360 — Original White",
    keywords: [],
    details: ["CIB"],
  },
]

function collection(id: number, name: string) {
  return { id, owner_id: 1, name, type: "video_game", access: "owner" }
}

function signInWithItems(ownedItems: OwnedItem[] = items) {
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: "1", username: "test-user", role: "user" },
      }),
    ),
    http.get(`${api}/collections`, () =>
      HttpResponse.json({
        collections: [
          collection(1, "Retro game shelf"),
          collection(2, "Games to sell"),
        ],
      }),
    ),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({ stats: [] }),
    ),
    http.get(`${api}/collections/:id/consoles`, () =>
      HttpResponse.json({ consoles: [] }),
    ),
    http.get(`${api}/collections/:id/games`, () =>
      HttpResponse.json({ games: [] }),
    ),
    http.get(`${api}/collections/:id/links`, () =>
      HttpResponse.json({ links: [] }),
    ),
    http.get(`${api}/console-labels`, () => HttpResponse.json({ labels: [] })),
    http.get(`${api}/items`, () => HttpResponse.json({ items: ownedItems })),
  )
}

const searchBox = () =>
  screen.getByRole("searchbox", { name: "Search all collections" })

const resultTitles = () =>
  within(screen.getByRole("list", { name: "Search results" }))
    .getAllByRole("button")
    .map((button) => button.getAttribute("aria-label"))

async function openSearch(route = "/?collection=1") {
  const { user, container } = renderApp(route)
  await screen.findByRole("heading", { name: "Retro game shelf" })
  await user.click(searchBox())
  await screen.findByRole("heading", { name: "Results in all collections" })
  return { user, container }
}

describe("search", () => {
  it("lists every owned item alphabetically when opened, with no collection selected", async () => {
    signInWithItems()
    await openSearch()

    expect(await screen.findByText("3 results")).toBeInTheDocument()
    expect(resultTitles()).toEqual([
      "View Halo 3",
      "View Pokémon Red",
      "View Xbox 360 — Original White",
    ])
    expect(
      screen.getByText("Xbox 360 · CIB · Retro game shelf"),
    ).toBeInTheDocument()
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    expect(
      within(sidebar).queryByRole("button", { pressed: true }),
    ).not.toBeInTheDocument()
  })

  it("narrows the results as you type, ignoring accents and word order", async () => {
    signInWithItems()
    const { user } = await openSearch()
    await screen.findByText("3 results")

    await user.type(searchBox(), "pokemon")
    expect(await screen.findByText("1 result")).toBeInTheDocument()
    expect(resultTitles()).toEqual(["View Pokémon Red"])

    await user.clear(searchBox())
    await user.type(searchBox(), "360 halo")
    expect(resultTitles()).toEqual(["View Halo 3"])
  })

  it("says when nothing matches", async () => {
    signInWithItems()
    const { user } = await openSearch()

    await user.type(searchBox(), "zelda")

    expect(
      await screen.findByText('Nothing matches "zelda".'),
    ).toBeInTheDocument()
  })

  it("shows at most 50 results with the total", async () => {
    signInWithItems(
      Array.from({ length: 60 }, (_, index) => ({
        ...items[0],
        id: index + 1,
        title: `Game ${String(index + 1).padStart(2, "0")}`,
      })),
    )
    await openSearch()

    expect(
      await screen.findByText("Showing 50 of 60, type to narrow"),
    ).toBeInTheDocument()
    expect(resultTitles()).toHaveLength(50)
  })

  it("clears the search on Escape, then closes on a second Escape", async () => {
    signInWithItems()
    const { user } = await openSearch()

    await user.type(searchBox(), "halo")
    await user.keyboard("{Escape}")
    expect(searchBox()).toHaveValue("")
    expect(
      screen.getByRole("heading", { name: "Results in all collections" }),
    ).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(
      await screen.findByRole("heading", { name: "Retro game shelf" }),
    ).toBeInTheDocument()
  })

  it("closes with the Close search button", async () => {
    signInWithItems()
    const { user } = await openSearch()

    await user.click(screen.getByRole("button", { name: "Close search" }))

    expect(
      await screen.findByRole("heading", { name: "Retro game shelf" }),
    ).toBeInTheDocument()
  })

  it("closes when a collection is picked in the sidebar", async () => {
    signInWithItems()
    const { user } = await openSearch()

    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    await user.click(
      within(sidebar).getByRole("button", { name: /Games to sell/ }),
    )

    expect(
      await screen.findByRole("heading", { name: "Games to sell" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Results in all collections" }),
    ).not.toBeInTheDocument()
  })

  it("opens a result's collection with its edit drawer open", async () => {
    signInWithItems()
    server.use(
      http.get(`${api}/collections/2/games`, () =>
        HttpResponse.json({
          games: [
            {
              id: 2,
              name: "Pokémon Red",
              condition: "Loose",
              console_label_id: 2,
              console_label: "Game Boy",
              last_played: null,
              completed: true,
            },
          ],
        }),
      ),
    )
    const { user } = await openSearch()
    await screen.findByText("3 results")

    await user.click(screen.getByRole("button", { name: "View Pokémon Red" }))

    const drawer = await screen.findByRole("dialog")
    expect(
      within(drawer).getByRole("heading", { name: "Pokémon Red" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Games to sell", hidden: true }),
    ).toBeInTheDocument()
  })

  it("opens from the URL, so a refresh keeps the search", async () => {
    signInWithItems()
    renderApp("/?collection=1&q=halo")

    expect(
      await screen.findByRole("heading", {
        name: "Results in all collections",
      }),
    ).toBeInTheDocument()
    expect(searchBox()).toHaveValue("halo")
    expect(await screen.findByText("1 result")).toBeInTheDocument()
  })

  it("has no accessibility violations with results showing", async () => {
    signInWithItems()
    const { container } = await openSearch()
    await screen.findByText("3 results")

    await expectNoViolations(container)
  })
})
