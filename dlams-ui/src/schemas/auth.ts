import * as z from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Please enter a username")
    .min(4, "Username too short"),
  password: z
    .string()
    .min(1, "Please enter a password")
    .min(6, "Password too short")
    .max(
      30,
      "What are you going for extra credit or something? Make it shorter..."
    ),
})

export type LoginFormValues = z.infer<typeof loginSchema>
