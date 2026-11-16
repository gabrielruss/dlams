import { describe, expect, it } from "vitest"

import { buildSearchEntries, searchEntries } from "./searchEntries"

const items = [
  { title: "Halo 3", keywords: ["Xbox 360"] },
  { title: "Pokémon Red", keywords: ["Game Boy"] },
  { title: "Xbox 360 — Original White", keywords: [] },
  { title: "Super Mario Bros. 3", keywords: ["NES"] },
  { title: "Okami", keywords: ["PS2"] },
  { title: "Ōkami HD", keywords: ["PS4"] },
  { title: "Mario Kart 64", keywords: ["N64"] },
]

const entries = buildSearchEntries(items, (item) => item)
const titles = (query: string) =>
  searchEntries(entries, query).map((item) => item.title)

describe("searchEntries", () => {
  it("lists everything alphabetically for an empty query", () => {
    expect(titles("  ")).toEqual([
      "Halo 3",
      "Mario Kart 64",
      "Okami",
      "Ōkami HD",
      "Pokémon Red",
      "Super Mario Bros. 3",
      "Xbox 360 — Original White",
    ])
  })

  it("ignores case and accents", () => {
    expect(titles("POKEMON")).toEqual(["Pokémon Red"])
    expect(titles("okami")).toEqual(["Okami", "Ōkami HD"])
  })

  it("needs every word, in any order, across the title and keywords", () => {
    expect(titles("360 halo")).toEqual(["Halo 3"])
    expect(titles("halo nes")).toEqual([])
  })

  it("does not search the details", () => {
    const withDetails = buildSearchEntries(
      [{ title: "Halo 3", keywords: ["Xbox 360"], details: ["Loose"] }],
      ({ title, keywords }) => ({ title, keywords }),
    )
    expect(searchEntries(withDetails, "loose")).toEqual([])
  })

  it("ranks titles starting with the query, then other title matches, then keyword matches", () => {
    expect(titles("mario")).toEqual(["Mario Kart 64", "Super Mario Bros. 3"])
    expect(titles("xbox")).toEqual(["Xbox 360 — Original White", "Halo 3"])
  })
})
