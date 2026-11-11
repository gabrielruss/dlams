import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoViolations } from "@/test/axe"
import { server } from "@/test/server"
import { renderApp } from "@/test/renderApp"
import type { CollectionAccess } from "@/types"

const api = "http://localhost/api"

function signInWithCollection(access: CollectionAccess) {
  server.use(
    http.get(`${api}/verify`, () =>
      HttpResponse.json({
        user: { id: 2, username: "test-user", role: "user" },
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
            access,
          },
        ],
      }),
    ),
    http.get(`${api}/collections/video-game-stats`, () =>
      HttpResponse.json({
        stats: [{ collection_id: 1, game_count: 1, console_count: 1 }],
      }),
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
          },
        ],
      }),
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
      }),
    ),
    http.get(`${api}/console-labels`, () => HttpResponse.json({ labels: [] })),
    http.get(`${api}/collections/1/links`, () =>
      HttpResponse.json({ links: [] }),
    ),
  )
}

describe("video game collection access", () => {
  it("lets an owner add, and open a row to view it", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")

    expect(await screen.findByText("Halo 3")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "New collection" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add console" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add game" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^View Xbox 360 — Original White/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Delete/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^View Halo 3/ }))
    const drawer = await screen.findByRole("dialog")
    expect(
      within(drawer).getByRole("heading", { name: "Halo 3" }),
    ).toBeInTheDocument()
    expect(within(drawer).getByText("Xbox 360")).toBeInTheDocument()
    expect(within(drawer).getByText("CIB")).toBeInTheDocument()
    expect(within(drawer).getByText("—")).toBeInTheDocument()
    expect(within(drawer).getByText("No")).toBeInTheDocument()
    expect(within(drawer).queryByLabelText("Game name")).not.toBeInTheDocument()
    expect(
      within(drawer).queryByRole("button", { name: "Save game" }),
    ).not.toBeInTheDocument()
    expect(
      within(drawer).getByRole("button", { name: "Delete game" }),
    ).toBeInTheDocument()
  })

  it("switches to the form with Edit, and Cancel returns to the view", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")

    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    expect(
      within(drawer).getByRole("heading", { name: "Edit game" }),
    ).toBeInTheDocument()
    const name = within(drawer).getByLabelText("Game name")
    expect(name).toHaveValue("Halo 3")
    expect(
      within(drawer).queryByRole("button", { name: "Delete game" }),
    ).not.toBeInTheDocument()

    name.focus()
    await user.clear(name)
    await user.keyboard("Typed and abandoned")
    within(drawer).getByRole("button", { name: "Cancel" }).focus()
    await user.keyboard("{Enter}")

    expect(
      within(drawer).getByRole("heading", { name: "Halo 3" }),
    ).toBeInTheDocument()
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    expect(within(drawer).getByLabelText("Game name")).toHaveValue("Halo 3")
  })

  it("returns to the view with the new values after saving", async () => {
    signInWithCollection("owner")
    const game = {
      id: 1,
      name: "Halo 3",
      condition: "CIB",
      console_label_id: 1,
      console_label: "Xbox 360",
      last_played: null,
      completed: false,
    }
    let savedName = game.name
    server.use(
      http.get(`${api}/collections/1/games`, () =>
        HttpResponse.json({ games: [{ ...game, name: savedName }] }),
      ),
      http.put(`${api}/collections/1/games/1`, async ({ request }) => {
        const body = (await request.json()) as { name: string }
        savedName = body.name
        return HttpResponse.json({ ...game, name: savedName })
      }),
    )

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    const name = within(drawer).getByLabelText("Game name")
    name.focus()
    await user.clear(name)
    await user.keyboard("Halo 3: ODST{Enter}")

    expect(
      await within(drawer).findByRole("heading", { name: "Halo 3: ODST" }),
    ).toBeInTheDocument()
    expect(savedName).toBe("Halo 3: ODST")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    expect(within(drawer).getByLabelText("Game name")).toHaveValue(
      "Halo 3: ODST",
    )
  })

  it("saves a game's condition and completed choices", async () => {
    signInWithCollection("owner")
    let savedBody: unknown = null
    server.use(
      http.put(`${api}/collections/1/games/1`, async ({ request }) => {
        savedBody = await request.json()
        return HttpResponse.json({})
      }),
    )

    const { user } = renderApp("/?collection=1&item=game-1")
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByLabelText("Condition").focus()
    await user.keyboard("{Enter}")
    const newOption = await screen.findByRole("option", {
      name: "New",
      hidden: true,
    })
    newOption.focus()
    await user.keyboard("{Enter}")
    within(drawer).getByRole("checkbox", { name: "Completed" }).focus()
    await user.keyboard(" ")
    within(drawer).getByRole("button", { name: "Save game" }).focus()
    await user.keyboard("{Enter}")

    await waitFor(() =>
      expect(savedBody).toEqual({
        name: "Halo 3",
        condition: "New",
        console_label: "Xbox 360",
        last_played: null,
        completed: true,
      }),
    )
  })

  describe("the last played picker", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] })
      vi.setSystemTime(new Date(2026, 10, 6, 12))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    const openPicker = async () => {
      const { user } = renderApp("/?collection=1&item=game-1")
      const drawer = await screen.findByRole("dialog")
      within(drawer).getByRole("button", { name: "Edit" }).focus()
      await user.keyboard("{Enter}")
      within(drawer)
        .getByRole("button", { name: /Last played/ })
        .focus()
      await user.keyboard("{Enter}")
      const calendar = await screen.findByRole("grid", { hidden: true })
      return { user, drawer, calendar }
    }

    const dayButton = (calendar: HTMLElement, date: Date) => {
      const button = calendar.querySelector<HTMLButtonElement>(
        `[data-day="${date.toLocaleDateString()}"]`,
      )
      if (!button) throw new Error(`No day button for ${date.toDateString()}`)
      return button
    }

    it("refuses days after today", async () => {
      signInWithCollection("owner")

      const { calendar } = await openPicker()

      expect(dayButton(calendar, new Date(2026, 10, 7))).toBeDisabled()
      expect(dayButton(calendar, new Date(2026, 10, 6))).toBeEnabled()
    })

    it("opens on today's date when none is set", async () => {
      signInWithCollection("owner")

      const { calendar } = await openPicker()

      await waitFor(() =>
        expect(dayButton(calendar, new Date(2026, 10, 6))).toHaveFocus(),
      )
    })

    it("moves between days with the arrow keys", async () => {
      signInWithCollection("owner")

      const { user, calendar } = await openPicker()
      await waitFor(() =>
        expect(dayButton(calendar, new Date(2026, 10, 6))).toHaveFocus(),
      )
      await user.keyboard("{ArrowLeft}")
      expect(dayButton(calendar, new Date(2026, 10, 5))).toHaveFocus()
      await user.keyboard("{ArrowUp}")
      expect(dayButton(calendar, new Date(2026, 9, 29))).toHaveFocus()
    })

    it("reaches the year and month dropdowns with the keyboard", async () => {
      signInWithCollection("owner")

      const { user, calendar } = await openPicker()
      await waitFor(() =>
        expect(dayButton(calendar, new Date(2026, 10, 6))).toHaveFocus(),
      )
      await user.tab({ shift: true })
      expect(
        screen.getByRole("combobox", { name: "Choose the Year", hidden: true }),
      ).toHaveFocus()
      await user.tab({ shift: true })
      expect(
        screen.getByRole("combobox", {
          name: "Choose the Month",
          hidden: true,
        }),
      ).toHaveFocus()
    })

    it("has no accessibility violations with the calendar open", async () => {
      signInWithCollection("owner")

      await openPicker()

      await expectNoViolations(document.body)
    })

    it("saves a picked day as the last played date", async () => {
      signInWithCollection("owner")
      let savedBody: unknown = null
      server.use(
        http.put(`${api}/collections/1/games/1`, async ({ request }) => {
          savedBody = await request.json()
          return HttpResponse.json({})
        }),
      )

      const { user, drawer, calendar } = await openPicker()
      dayButton(calendar, new Date(2026, 10, 5)).focus()
      await user.keyboard("{Enter}")

      expect(
        within(drawer).getByRole("button", { name: "Last played 11-05-2026" }),
      ).toBeInTheDocument()
      within(drawer).getByRole("button", { name: "Save game" }).focus()
      await user.keyboard("{Enter}")

      await waitFor(() =>
        expect(savedBody).toMatchObject({ last_played: "2026-11-05" }),
      )
    })
  })

  it("starts in the view again after closing while editing", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByRole("button", { name: "Close drawer" }).focus()
    await user.keyboard("{Enter}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: /^View Halo 3/ }))
    const reopened = await screen.findByRole("dialog")
    expect(
      within(reopened).getByRole("heading", { name: "Halo 3" }),
    ).toBeInTheDocument()
    expect(
      within(reopened).queryByLabelText("Game name"),
    ).not.toBeInTheDocument()
  })

  it("opens an item's drawer from the URL", async () => {
    signInWithCollection("owner")

    renderApp("/?collection=1&item=console-1")

    const drawer = await screen.findByRole("dialog")
    expect(
      within(drawer).getByRole("heading", { name: "Xbox 360" }),
    ).toBeInTheDocument()
    expect(within(drawer).getByText("Original White")).toBeInTheDocument()
    expect(
      within(drawer).queryByLabelText("Edition / details"),
    ).not.toBeInTheDocument()
  })

  it("shows the last played date as month-day-year", async () => {
    signInWithCollection("owner")
    server.use(
      http.get(`${api}/collections/1/games`, () =>
        HttpResponse.json({
          games: [
            {
              id: 1,
              name: "Halo 3",
              condition: "CIB",
              console_label_id: 1,
              console_label: "Xbox 360",
              last_played: "2026-11-05",
              completed: false,
            },
          ],
        }),
      ),
    )

    renderApp("/?collection=1&item=game-1")

    const drawer = await screen.findByRole("dialog")
    expect(within(drawer).getByText("11-05-2026")).toBeInTheDocument()
    expect(
      screen.getByText(/Last played 11-05-2026/, { ignore: "[role=dialog] *" }),
    ).toBeInTheDocument()
  })

  it("opens nothing for an item that is not in the collection", async () => {
    signInWithCollection("owner")

    renderApp("/?collection=1&item=game-99")

    expect(await screen.findByText("Halo 3")).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes an item's drawer and keeps the collection", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Close drawer" }).focus()
    await user.keyboard("{Enter}")

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
    expect(
      screen.getByRole("heading", { name: "Retro game shelf" }),
    ).toBeInTheDocument()
  })

  it("deletes a game from its drawer after confirming", async () => {
    signInWithCollection("owner")
    let deleted = false
    server.use(
      http.delete(`${api}/collections/1/games/1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    vi.spyOn(window, "confirm").mockReturnValueOnce(true)

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Delete game" }).focus()
    await user.keyboard("{Enter}")

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
    expect(deleted).toBe(true)
    expect(window.confirm).toHaveBeenCalledWith(
      'Delete "Halo 3"? This cannot be undone.',
    )
  })

  it("offers no Delete while adding a new game", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    await screen.findByText("Halo 3")
    await user.click(screen.getByRole("button", { name: "Add game" }))
    const drawer = await screen.findByRole("dialog")

    expect(
      within(drawer).queryByRole("button", { name: "Delete game" }),
    ).not.toBeInTheDocument()
    expect(
      within(drawer).getByRole("heading", { name: "Add game" }),
    ).toBeInTheDocument()
    expect(within(drawer).getByLabelText("Game name")).toBeInTheDocument()
  })

  it("clears a failed save's error after Cancel and Edit", async () => {
    signInWithCollection("owner")
    server.use(
      http.put(`${api}/collections/1/games/1`, () =>
        HttpResponse.json({ detail: "Could not save" }, { status: 500 }),
      ),
    )

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByLabelText("Game name").focus()
    await user.keyboard("{Enter}")
    expect(await within(drawer).findByRole("alert")).toHaveTextContent(
      "Could not save",
    )

    within(drawer).getByRole("button", { name: "Cancel" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")

    expect(within(drawer).getByLabelText("Game name")).toBeInTheDocument()
    expect(within(drawer).queryByRole("alert")).not.toBeInTheDocument()
  })

  it("switches a console between its view and form, and saves back to the view", async () => {
    signInWithCollection("owner")
    const consoleRecord = {
      id: 1,
      console_label_id: 1,
      label: "Xbox 360",
      edition: "Original White",
      condition: "CIB",
    }
    let savedEdition = consoleRecord.edition
    server.use(
      http.get(`${api}/collections/1/consoles`, () =>
        HttpResponse.json({
          consoles: [{ ...consoleRecord, edition: savedEdition }],
        }),
      ),
      http.put(`${api}/collections/1/consoles/1`, async ({ request }) => {
        const body = (await request.json()) as { edition: string }
        savedEdition = body.edition
        return HttpResponse.json({ ...consoleRecord, edition: savedEdition })
      }),
    )

    const { user } = renderApp("/?collection=1&item=console-1")
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    expect(
      within(drawer).getByRole("heading", { name: "Edit console" }),
    ).toBeInTheDocument()
    const edition = within(drawer).getByLabelText("Edition / details")
    expect(edition).toHaveValue("Original White")

    edition.focus()
    await user.clear(edition)
    await user.keyboard("Elite{Enter}")

    expect(await within(drawer).findByText("Elite")).toBeInTheDocument()
    expect(
      within(drawer).getByRole("heading", { name: "Xbox 360" }),
    ).toBeInTheDocument()
    expect(savedEdition).toBe("Elite")
  })

  it("opens Add empty after an item was opened and edited", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    await user.click(
      await screen.findByRole("button", { name: /^View Halo 3/ }),
    )
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByRole("button", { name: "Close drawer" }).focus()
    await user.keyboard("{Enter}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Add game" }))
    const addDrawer = await screen.findByRole("dialog")
    expect(within(addDrawer).getByLabelText("Game name")).toHaveValue("")
  })

  it("shows a shared collection to read without any write controls", async () => {
    signInWithCollection("view-only")

    renderApp("/")

    expect(await screen.findByText("Halo 3")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Add console" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Add game" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^(View|Edit)/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Delete/ }),
    ).not.toBeInTheDocument()
  })

  it("returns focus to Add game after closing its drawer", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/")
    const addGame = await screen.findByRole("button", { name: "Add game" })
    addGame.focus()
    await user.keyboard("{Enter}")
    const drawer = await screen.findByRole("dialog")
    await waitFor(() =>
      expect(within(drawer).getByLabelText("Game name")).toHaveFocus(),
    )
    await user.keyboard("{Escape}")

    await waitFor(() => expect(addGame).toHaveFocus())
  })

  it("has no accessibility violations on the collection view", async () => {
    signInWithCollection("owner")

    const { container } = renderApp("/")
    await screen.findByText("Halo 3")

    await expectNoViolations(container)
  })

  it("has no accessibility violations viewing and editing an item", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/?collection=1&item=game-1")
    const drawer = await screen.findByRole("dialog")
    await expectNoViolations(document.body)

    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    expect(within(drawer).getByLabelText("Game name")).toBeInTheDocument()
    await expectNoViolations(document.body)
  })

  it("has no accessibility violations with the Condition list open", async () => {
    signInWithCollection("owner")

    const { user } = renderApp("/?collection=1&item=game-1")
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByLabelText("Condition").focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("option", { name: "New", hidden: true })

    await expectNoViolations(document.body, ["region"])
  })

  it("has no accessibility violations with the Console list open", async () => {
    signInWithCollection("owner")
    server.use(
      http.get(`${api}/console-labels`, () =>
        HttpResponse.json({
          labels: [
            { id: 1, name: "Xbox 360" },
            { id: 2, name: "PlayStation 2" },
          ],
        }),
      ),
    )

    const { user } = renderApp("/?collection=1&item=game-1")
    const drawer = await screen.findByRole("dialog")
    within(drawer).getByRole("button", { name: "Edit" }).focus()
    await user.keyboard("{Enter}")
    within(drawer).getByLabelText("Console").focus()
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("option", { name: "Xbox 360", hidden: true })

    await expectNoViolations(document.body, ["region"])
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
    },
  )
})
