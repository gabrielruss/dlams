import type { ConsoleRecord, GameRecord } from "@/components/video-games/types"

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
