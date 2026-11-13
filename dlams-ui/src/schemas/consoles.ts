import * as z from "zod"

import { videoGameConditions } from "@/components/video-games/types"

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
