import type { CountNames } from "@/types/items"

export interface ContentCount {
  count: number
  names: CountNames
}

function countText({ count, names }: ContentCount) {
  return `${count} ${count === 1 ? names.one : names.many}`
}

function joinWithAnd(countTexts: string[]) {
  if (countTexts.length <= 2) return countTexts.join(" and ")
  return `${countTexts.slice(0, -1).join(", ")}, and ${countTexts.at(-1)}`
}

export function describeContents(counts: ContentCount[]) {
  const countTexts = counts.filter(({ count }) => count > 0).map(countText)
  return joinWithAnd(countTexts)
}
