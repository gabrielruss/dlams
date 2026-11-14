import * as z from "zod"

import { videoGameConditions } from "@/features/video-games/types"
import { isAfterToday } from "@/lib/dates"

export const consoleFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Console label is required")
    .max(100, "Console label must be 100 characters or fewer"),
  edition: z
    .string()
    .trim()
    .max(100, "Edition must be 100 characters or fewer"),
  condition: z.enum(videoGameConditions),
})

export type ConsoleFormValues = z.infer<typeof consoleFormSchema>

export const gameFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Game name is required")
    .max(200, "Game name must be 200 characters or fewer"),
  consoleLabel: z
    .string()
    .trim()
    .min(1, "Console is required")
    .max(100, "Console must be 100 characters or fewer"),
  condition: z.enum(videoGameConditions),
  lastPlayed: z
    .string()
    .refine(
      (value) => !value || !isAfterToday(value),
      "Last played can't be in the future",
    ),
  completed: z.boolean(),
})

export type GameFormValues = z.infer<typeof gameFormSchema>
