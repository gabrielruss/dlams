import { expect } from "vitest"
import { configureAxe } from "vitest-axe"

const axe = configureAxe({
  rules: { "color-contrast": { enabled: false } },
})

export async function expectNoViolations(container: Element) {
  const { violations } = await axe(container)
  const summary = violations.map(
    ({ id, help, nodes }) =>
      `${id}: ${help} (${nodes.map((node) => node.target.join(" ")).join(", ")})`
  )
  expect(summary).toEqual([])
}
