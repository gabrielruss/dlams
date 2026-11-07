import { expect } from "vitest"
import { configureAxe } from "vitest-axe"

const axe = configureAxe({
  rules: { "color-contrast": { enabled: false } },
})

export async function expectNoViolations(
  container: Element,
  ignoredRuleIds: string[] = [],
) {
  const rules = Object.fromEntries(
    ignoredRuleIds.map((ruleId) => [ruleId, { enabled: false }]),
  )
  const { violations } = await axe(container, { rules })
  const summary = violations.map(
    ({ id, help, nodes }) =>
      `${id}: ${help} (${nodes.map((node) => node.target.join(" ")).join(", ")})`,
  )
  expect(summary).toEqual([])
}
