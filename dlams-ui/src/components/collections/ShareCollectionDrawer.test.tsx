import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"
import type { CollectionAccess, CollectionLink } from "@/types"
import type { UserRole } from "@/types/user"

const api = "http://localhost/api"

function link(id: number, name: string | null): CollectionLink {
  return {
    id,
    name,
    token: `token-${id}`,
    created_at: "2026-10-30T12:00:00Z",
  }
}

function signIn({
  access = "owner",
  role = "user",
  links = [link(1, "For Dana")],
}: {
  access?: CollectionAccess
  role?: UserRole
  links?: CollectionLink[]
} = {}) {
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({ user: { id: "2", username: "test-user", role } })
    ),
    http.get(`${api}/collections`, () =>
      HttpResponse.json({
        collections: [
          {
            id: 1,
            owner_id: 2,
            name: "Retro game shelf",
            type: "video_game",
            access,
          },
        ],
      })
    ),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({ stats: [] })
    ),
    http.get(`${api}/collections/1/consoles`, () =>
      HttpResponse.json({ consoles: [] })
    ),
    http.get(`${api}/collections/1/games`, () =>
      HttpResponse.json({ games: [] })
    ),
    http.get(`${api}/console-labels`, () => HttpResponse.json({ labels: [] })),
    http.get(`${api}/collections/1/links`, () => HttpResponse.json({ links })),
    http.post(`${api}/collections/1/links`, async ({ request }) => {
      const { name } = (await request.json()) as { name: string | null }
      const created = link(links.length + 10, name)
      links.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.delete(`${api}/collections/1/links/:linkId`, ({ params }) => {
      const index = links.findIndex((item) => item.id === Number(params.linkId))
      links.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    })
  )
}

async function openShareDrawer() {
  const rendered = renderApp("/")
  await rendered.user.click(
    await screen.findByRole("button", { name: "Share", description: /active link/ })
  )
  const drawer = await screen.findByRole("dialog")
  await within(drawer).findByText("For Dana")
  return { ...rendered, drawer }
}

async function press(element: HTMLElement, user: ReturnType<typeof renderApp>["user"]) {
  element.focus()
  await user.keyboard("{Enter}")
}

describe("sharing a collection by link", () => {
  it("creates a named link and copies it", async () => {
    signIn()
    const { user, drawer } = await openShareDrawer()

    await press(
      within(drawer).getByRole("button", { name: "Create read-only link" }),
      user
    )
    within(drawer).getByLabelText("Link name (optional)").focus()
    await user.keyboard("Hiring team{Enter}")

    expect(await within(drawer).findByText("Hiring team")).toBeInTheDocument()

    await press(
      within(drawer).getByRole("button", { name: "Copy link for Hiring team" }),
      user
    )
    expect(await navigator.clipboard.readText()).toBe(
      `${window.location.origin}/s/token-11`
    )
    const copyButton = within(drawer).getByRole("button", {
      name: "Copy link for Hiring team",
    })
    expect(copyButton).toHaveTextContent("Copied")
    expect(within(drawer).getByText("Link copied")).toHaveAttribute(
      "role",
      "status"
    )

    await waitFor(() => expect(copyButton).toHaveTextContent("Copy link"), {
      timeout: 3000,
    })
  })

  it("shows the link to copy by hand when copying fails", async () => {
    signIn()
    const { user, drawer } = await openShareDrawer()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("Clipboard blocked")
    )

    await press(
      within(drawer).getByRole("button", { name: "Copy link for For Dana" }),
      user
    )

    const alert = await within(drawer).findByRole("alert")
    expect(alert).toHaveTextContent("Couldn't copy the link")
    expect(alert).toHaveTextContent(`${window.location.origin}/s/token-1`)
  })

  it("deletes a link only after confirming", async () => {
    signIn({ links: [link(1, "For Dana"), link(2, null)] })
    const { user, drawer } = await openShareDrawer()
    const deleteDana = "Delete link for For Dana"

    await press(within(drawer).getByRole("button", { name: deleteDana }), user)
    await press(within(drawer).getByRole("button", { name: "Keep link" }), user)
    expect(within(drawer).getByText("For Dana")).toBeInTheDocument()

    await press(within(drawer).getByRole("button", { name: deleteDana }), user)
    await press(within(drawer).getByRole("button", { name: "Don't Look At My Stuff" }), user)

    await within(drawer).findByText("Unnamed link")
    expect(within(drawer).queryByText("For Dana")).not.toBeInTheDocument()
  })

  it("stops offering new links at five", async () => {
    signIn({
      links: [1, 2, 3, 4, 5].map((id) => link(id, id === 1 ? "For Dana" : null)),
    })
    const { drawer } = await openShareDrawer()

    expect(
      within(drawer).getByText(/A collection can have 5 links/)
    ).toBeInTheDocument()
    expect(
      within(drawer).queryByRole("button", { name: "Create read-only link" })
    ).not.toBeInTheDocument()
  })

  it("shows how many links are active under the Share button", async () => {
    signIn({ links: [link(1, "For Dana"), link(2, null)] })
    const { user, drawer } = await openShareDrawer()

    expect(screen.getByText("2 active links")).toBeInTheDocument()
    await press(
      within(drawer).getByRole("button", { name: "Delete link for For Dana" }),
      user
    )
    await press(
      within(drawer).getByRole("button", { name: "Don't Look At My Stuff" }),
      user
    )

    expect(await screen.findByText("1 active link")).toBeInTheDocument()
  })

  it("shows no count when a collection has no links", async () => {
    signIn({ links: [] })

    renderApp("/")

    expect(
      await screen.findByText("No consoles in this collection yet.")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument()
    expect(screen.queryByText(/active link/)).not.toBeInTheDocument()
  })

  it("offers Share in a demo session", async () => {
    signIn({ role: "sandbox" })

    renderApp("/")

    expect(
      await screen.findByRole("button", { name: "Share" })
    ).toBeInTheDocument()
  })

  it("offers no Share button on a shared collection", async () => {
    signIn({ access: "view-only" })

    renderApp("/")

    expect(
      await screen.findByText("No consoles in this collection yet.")
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Share" })
    ).not.toBeInTheDocument()
  })

  it("has no accessibility violations with the drawer open", async () => {
    signIn()
    await openShareDrawer()

    await expectNoViolations(document.body)
  })
})
