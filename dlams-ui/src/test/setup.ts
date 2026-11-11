import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { server } from "./server"

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
Object.defineProperty(document, "fonts", {
  value: { addEventListener() {}, removeEventListener() {} },
})

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

beforeAll(async () => {
  await Promise.all([
    import("@/pages/Home"),
    import("@/pages/Login"),
    import("@/pages/Register"),
    import("@/pages/AdminUsers"),
    import("@/pages/SharedCollection"),
  ])
})
