import * as z from "zod"

import { isAfterToday } from "@/lib/dates"
import { videoGameConditions } from "@/components/video-games/types"

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
