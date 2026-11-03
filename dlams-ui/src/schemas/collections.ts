import * as z from "zod"

export const collectionNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Collection name is required")
    .max(100, "Collection names can be at most 100 characters"),
})

export type CollectionNameFormValues = z.infer<typeof collectionNameSchema>
