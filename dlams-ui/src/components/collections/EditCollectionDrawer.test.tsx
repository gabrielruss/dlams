import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { expectNoViolations } from "@/test/axe"
import { renderApp } from "@/test/renderApp"
import { server } from "@/test/server"

const api = "http://localhost/api"

function collection(id: number, name: string) {
  return { id, owner_id: 1, name, type: "video_game", access: "owner" }
}

function signIn() {
  let collections = [
    collection(1, "Retro game shelf"),
    collection(2, "Games to sell"),
  ]
  const requests = { renamedTo: "", deleted: false }
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: 1, username: "test-user", role: "user" },
      }),
    ),
    http.get(`${api}/collections`, () => HttpResponse.json({ collections })),
    http.put(`${api}/collections/1`, async ({ request }) => {
      const body = (await request.json()) as { name: string }
      requests.renamedTo = body.name
      collections = collections.map((c) =>
        c.id === 1 ? { ...c, name: body.name } : c,
      )
      return HttpResponse.json(collections[0])
    }),
    http.delete(`${api}/collections/1`, () => {
      requests.deleted = true
      collections = collections.filter((c) => c.id !== 1)
      return new HttpResponse(null, { status: 204 })
    }),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({
        stats: [
          { collection_id: 1, game_count: 2, console_count: 1 },
          { collection_id: 2, game_count: 1, console_count: 0 },
        ],
      }),
    ),
    http.get(`${api}/collections/:id/consoles`, () =>
      HttpResponse.json({ consoles: [] }),
    ),
    http.get(`${api}/collections/:id/games`, () =>
      HttpResponse.json({ games: [] }),
    ),
    http.get(`${api}/collections/1/links`, () =>
      HttpResponse.json({
        links: [
          {
            id: 1,
            name: null,
            token: "token-1",
            created_at: "2026-11-01T00:00:00Z",
          },
        ],
      }),
    ),
    http.get(`${api}/collections/2/links`, () =>
      HttpResponse.json({ links: [] }),
    ),
    http.get(`${api}/console-labels`, () => HttpResponse.json({ labels: [] })),
  )
  return requests
}

async function openEditDrawer() {
  const rendered = renderApp("/?collection=1")
  await screen.findByRole("heading", { name: "Retro game shelf" })
  await rendered.user.click(screen.getByRole("button", { name: "Edit" }))
  const drawer = await screen.findByRole("dialog")
  return { ...rendered, drawer }
}

describe("editing a collection", () => {
  it("renames the collection", async () => {
    const requests = signIn()
    const { user, drawer } = await openEditDrawer()

    const name = within(drawer).getByLabelText("Collection name")
    expect(name).toHaveValue("Retro game shelf")
    name.focus()
    await user.clear(name)
    await user.keyboard("Retro shelf{Enter}")

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
    expect(requests.renamedTo).toBe("Retro shelf")
    expect(
      await screen.findByRole("heading", { name: "Retro shelf" }),
    ).toBeInTheDocument()
  })

  it("will not save a blank name", async () => {
    const requests = signIn()
    const { user, drawer } = await openEditDrawer()

    const name = within(drawer).getByLabelText("Collection name")
    name.focus()
    await user.clear(name)
    await user.keyboard("   {Enter}")

    expect(
      await within(drawer).findByText("Collection name is required"),
    ).toBeInTheDocument()
    expect(requests.renamedTo).toBe("")
  })

  it("says what goes with the collection, then deletes it", async () => {
    const requests = signIn()
    const { user, drawer } = await openEditDrawer()

    within(drawer).getByRole("button", { name: "Delete collection" }).focus()
    await user.keyboard("{Enter}")

    expect(
      await within(drawer).findByText(
        /This also deletes 1 console, 2 games, and 1 share link\./,
      ),
    ).toBeInTheDocument()
    within(drawer).getByRole("button", { name: "Delete collection" }).focus()
    await user.keyboard("{Enter}")

    await waitFor(() => expect(requests.deleted).toBe(true))
    expect(
      await screen.findByRole("heading", { name: "Games to sell" }),
    ).toBeInTheDocument()
  })

  it.each([
    ["stats", "collections/video-game-stats"],
    ["share links", "collections/1/links"],
  ])("says it could not count when the %s fail to load", async (_, path) => {
    signIn()
    server.use(
      http.get(`${api}/${path}`, () =>
        HttpResponse.json({ detail: "Could not load" }, { status: 500 }),
      ),
    )
    const { user, drawer } = await openEditDrawer()

    within(drawer).getByRole("button", { name: "Delete collection" }).focus()
    await user.keyboard("{Enter}")

    expect(
      await within(drawer).findByText(/We couldn't count what goes with it/),
    ).toBeInTheDocument()
    expect(within(drawer).queryByText(/It's empty/)).not.toBeInTheDocument()
    expect(
      within(drawer).getByRole("button", { name: "Delete collection" }),
    ).toBeEnabled()
  })

  it("says an empty collection is empty", async () => {
    signIn()
    server.use(
      http.get(`${api}/collections/video-game-stats`, () =>
        HttpResponse.json({
          stats: [{ collection_id: 1, game_count: 0, console_count: 0 }],
        }),
      ),
      http.get(`${api}/collections/1/links`, () =>
        HttpResponse.json({ links: [] }),
      ),
    )
    const { user, drawer } = await openEditDrawer()

    within(drawer).getByRole("button", { name: "Delete collection" }).focus()
    await user.keyboard("{Enter}")

    expect(await within(drawer).findByText(/It's empty\./)).toBeInTheDocument()
  })

  it("keeps the collection when the delete is cancelled", async () => {
    const requests = signIn()
    const { user, drawer } = await openEditDrawer()

    within(drawer).getByRole("button", { name: "Delete collection" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByRole("button", { name: "Keep collection" }).focus()
    await user.keyboard("{Enter}")

    expect(within(drawer).getByLabelText("Collection name")).toBeInTheDocument()
    expect(requests.deleted).toBe(false)
  })

  it("has no accessibility violations with the drawer open", async () => {
    signIn()
    await openEditDrawer()

    await expectNoViolations(document.body)
  })
})
