export interface Searchable {
  title: string
  keywords: string[]
}

export interface SearchEntry<T> {
  value: T
  title: string
  text: string
}

// ex: changes Pokémon to pokemon for better search matching
export function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

export function buildSearchEntries<T>(
  values: T[],
  toSearchable: (value: T) => Searchable,
): SearchEntry<T>[] {
  return values.map((value) => {
    const { title, keywords } = toSearchable(value)
    const normalizedTitle = normalizeForSearch(title)
    return {
      value,
      title: normalizedTitle,
      text: [normalizedTitle, ...keywords.map(normalizeForSearch)].join(" "),
    }
  })
}

function rank(entry: SearchEntry<unknown>, query: string, words: string[]) {
  // lower number is best result
  if (entry.title.startsWith(query)) return 0 // the entry starts with the search
  if (words.every((word) => entry.title.includes(word))) return 1 // the entry contains the search
  return 2
}

export function searchEntries<T>(entries: SearchEntry<T>[], query: string): T[] {
  const normalizedQuery = normalizeForSearch(query).trim()
  const words = normalizedQuery.split(/\s+/).filter(Boolean) // put every word in an array and filter out ""
  return entries
    .filter((entry) => words.every((word) => entry.text.includes(word))) // every word of the search must appear in the entry
    .map((entry) => ({ entry, rank: rank(entry, normalizedQuery, words) }))
    .sort(
      (a, b) => a.rank - b.rank || a.entry.title.localeCompare(b.entry.title),
    ) // sort by rank then alphabetically
    .map(({ entry }) => entry.value) // drop the ranking now that things are in order
}
