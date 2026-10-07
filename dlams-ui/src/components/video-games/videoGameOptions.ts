import { videoGameConditions, type VideoGameCondition } from "@/types/videoGames"

export function isVideoGameCondition(
  value: string,
): value is VideoGameCondition {
  return videoGameConditions.some((condition) => condition === value)
}
