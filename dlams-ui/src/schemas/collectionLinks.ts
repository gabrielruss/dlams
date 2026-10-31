import * as z from "zod"

export const linkNameSchema = z.object({
  name: z.string().trim().max(50, "Link names can be at most 50 characters"),
})

export type LinkNameFormValues = z.infer<typeof linkNameSchema>
