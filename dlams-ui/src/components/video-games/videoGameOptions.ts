import {
  type ConsoleRecord,
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
