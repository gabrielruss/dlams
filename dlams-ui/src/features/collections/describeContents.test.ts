import { describe, expect, it } from "vitest"

import { itemTypeNames } from "@/types/items"
import { describeContents } from "./describeContents"

const links = { one: "share link", many: "share links" }

describe("describeContents", () => {
  it("lists each kind with a count, in order", () => {
    expect(
      describeContents([
        { count: 1, names: itemTypeNames.console },
        { count: 2, names: itemTypeNames.game },
        { count: 3, names: links },
      ]),
    ).toBe("1 console, 2 games, and 3 share links")
  })

  it("leaves out kinds with none", () => {
    expect(
      describeContents([
        { count: 0, names: itemTypeNames.console },
        { count: 1, names: itemTypeNames.game },
        { count: 2, names: links },
      ]),
    ).toBe("1 game and 2 share links")
  })

  it("is empty when there is nothing", () => {
    expect(describeContents([{ count: 0, names: itemTypeNames.console }])).toBe(
      "",
    )
  })
})
