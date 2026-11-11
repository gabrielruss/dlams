export type UserRole = "user" | "admin" | "template" | "sandbox"

export type AssignableRole = Extract<UserRole, "user" | "template">

export interface User {
  id: number
  username: string
  role: UserRole
}
