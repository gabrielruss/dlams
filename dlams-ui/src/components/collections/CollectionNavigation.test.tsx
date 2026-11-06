import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { renderApp } from "@/test/renderApp"
import { server } from "@/test/server"

const api = "http://localhost/api"

function signInWithNoCollections() {
  const requests = { createdBody: null as unknown }
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: "1", username: "test-user", role: "user" },
      }),
    ),
    http.get(`${api}/collections`, () =>
      HttpResponse.json({ collections: [] }),
    ),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({ stats: [] }),
    ),
    http.post(`${api}/collections`, async ({ request }) => {
      requests.createdBody = await request.json()
      return HttpResponse.json({
        id: 3,
        owner_id: 1,
        name: "Games to sell",
        type: "video_game",
        access: "owner",
      })
    }),
  )
  return requests
}

async function openCreateDrawer() {
  const { user } = renderApp("/")
  const newCollection = await screen.findByRole("button", {
    name: "New collection",
  })
  newCollection.focus()
  await user.keyboard("{Enter}")
  const drawer = await screen.findByRole("dialog")
  return { user, drawer }
}

describe("creating a collection", () => {
  it("creates a collection with the trimmed name", async () => {
    const requests = signInWithNoCollections()

    const { user, drawer } = await openCreateDrawer()
    within(drawer).getByLabelText("Collection name").focus()
    await user.keyboard("  Games to sell  {Enter}")

    await waitFor(() =>
      expect(requests.createdBody).toEqual({
        name: "Games to sell",
        type: "video_game",
      }),
    )
  })

  it("opens from the empty collection area as well as the sidebar", async () => {
    signInWithNoCollections()

    const { user } = renderApp("/")
    expect(await screen.findByText("No collections yet.")).toBeInTheDocument()
    const main = screen.getByRole("main")
    within(main).getByRole("button", { name: "Create collection" }).focus()
    await user.keyboard("{Enter}")

    const drawer = await screen.findByRole("dialog")
    expect(
      within(drawer).getByRole("heading", { name: "Create collection" }),
    ).toBeInTheDocument()
  })

  it("asks for a name instead of sending a blank one", async () => {
    const requests = signInWithNoCollections()

    const { user, drawer } = await openCreateDrawer()
    within(drawer).getByRole("button", { name: "Create collection" }).focus()
    await user.keyboard("{Enter}")

    expect(
      await within(drawer).findByText("Collection name is required"),
    ).toBeInTheDocument()
    expect(requests.createdBody).toBeNull()
  })
})
