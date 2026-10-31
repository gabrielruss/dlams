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
        ],
      })
    )
  )
}

describe("the shared collection page", () => {
  it("shows the collection read-only without signing in", async () => {
    shareCollection()

    renderApp("/s/token-1")

    expect(
      await screen.findByRole("heading", { name: "Retro game shelf" })
    ).toBeInTheDocument()
    expect(screen.getByText("Halo 3")).toBeInTheDocument()
    expect(screen.getByText("Xbox 360 — Original White")).toBeInTheDocument()
    expect(screen.getByText(/This view is read-only/)).toBeInTheDocument()
    expect(screen.getByText("Video games")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^(Add|Edit|Delete|Share)/ })
    ).not.toBeInTheDocument()
  })

  it("says when a link is no longer active", async () => {
    server.use(
      http.get(`${api}/shared/gone`, () =>
        HttpResponse.json(
          { detail: "This link is no longer active." },
          { status: 404 }
        )
      )
    )

    renderApp("/s/gone")

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This link is no longer active."
    )
  })

  it("has no accessibility violations", async () => {
    shareCollection()

    const { container } = renderApp("/s/token-1")
    await screen.findByText("Halo 3")

    await expectNoViolations(container)
  })
})
