export type UserRole = "user" | "admin" | "template" | "sandbox"

export type AssignableRole = Extract<UserRole, "user" | "template">

export interface User {
  id: string
  username: string
  role: UserRole
}
