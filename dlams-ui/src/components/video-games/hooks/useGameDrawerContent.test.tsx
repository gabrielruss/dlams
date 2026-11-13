import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import { server } from "@/test/server"
import type { GameRecord } from "@/components/video-games/types"
import useGameDrawerContent from "./useGameDrawerContent"

const api = "http://localhost/api"

const game: GameRecord = {
  id: 1,
  name: "Halo 3",
  condition: "CIB",
  console_label_id: 1,
  console_label: "Xbox 360",
  last_played: null,
  completed: false,
}

function renderDrawerContent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const onClose = vi.fn()
  const rendered = renderHook(
    ({ openedGame }: { openedGame: GameRecord | undefined }) =>
      useGameDrawerContent({ collectionId: 1, openedGame, onClose }),
    { wrapper, initialProps: { openedGame: game as GameRecord | undefined } },
  )
  return { ...rendered, onClose }
}

describe("useGameDrawerContent while the drawer slides closed", () => {
  it("keeps showing the game after the URL no longer names it", () => {
    const { result, rerender } = renderDrawerContent()

    rerender({ openedGame: undefined })

    expect(result.current.shownGame).toEqual(game)
    expect(result.current.isEditing).toBe(false)
  })

  it("stays in edit mode after the URL no longer names the game", () => {
    const { result, rerender } = renderDrawerContent()

    act(() => result.current.startEditing())
    rerender({ openedGame: undefined })

    expect(result.current.shownGame).toEqual(game)
    expect(result.current.isEditing).toBe(true)
  })

  it("updates the game, not creates one, for a save during the slide", async () => {
    let created = false
    let updated = false
    server.use(
      http.post(`${api}/collections/1/games`, () => {
        created = true
        return HttpResponse.json(game)
      }),
      http.put(`${api}/collections/1/games/1`, () => {
        updated = true
        return HttpResponse.json(game)
      }),
    )
    const { result, rerender } = renderDrawerContent()

    act(() => result.current.startEditing())
    rerender({ openedGame: undefined })
    act(() =>
      result.current.saveGame({
        name: "Halo 3",
        condition: "CIB",
        consoleLabel: "Xbox 360",
        lastPlayed: "",
        completed: false,
      }),
    )

    await waitFor(() => expect(updated).toBe(true))
    expect(created).toBe(false)
  })
})
