import {
  type ConsoleRecord,
  type GameRecord,
  videoGameConditions,
  type VideoGameCondition,
} from "@/types/videoGames"

export function isVideoGameCondition(
  value: string,
): value is VideoGameCondition {
  return videoGameConditions.some((condition) => condition === value)
}

export function consoleName(consoleRecord: ConsoleRecord) {
  return consoleRecord.edition
    ? `${consoleRecord.label} — ${consoleRecord.edition}`
    : consoleRecord.label
}

export const consoleSearchable = (consoleRecord: ConsoleRecord) => ({
  title: consoleName(consoleRecord),
  keywords: [],
})

export const gameSearchable = (game: GameRecord) => ({
  title: game.name,
  keywords: [game.console_label],
})
