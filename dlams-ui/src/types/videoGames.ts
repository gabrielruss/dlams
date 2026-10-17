export const videoGameConditions = [
  "Loose",
  "CIB",
  "New",
  "Item & Box",
] as const

export type VideoGameCondition = (typeof videoGameConditions)[number]

export interface ConsoleRecord {
  id: number
  console_label_id: number
  label: string
  edition: string | null
  condition: VideoGameCondition
  game_count: number
}

export interface ConsoleLabel {
  id: number
  name: string
}

export interface ConsoleCreate {
  label: string
  edition: string | null
  condition: VideoGameCondition
}

export interface GameRecord {
  id: number
  name: string
  condition: VideoGameCondition
  console_label_id: number
  console_label: string
  last_played: string | null
  completed: boolean
}

export interface VideoGameCollectionStats {
  collection_id: number
  game_count: number
  console_count: number
}

export interface GameCreate {
  name: string
  condition: VideoGameCondition
  console_label: string
  last_played: string | null
  completed: boolean
}
