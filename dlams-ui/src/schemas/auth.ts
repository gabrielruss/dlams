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

export const registerSchema = loginSchema
  .extend({
    invitationCode: z.string().min(1, "An invitation code is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
