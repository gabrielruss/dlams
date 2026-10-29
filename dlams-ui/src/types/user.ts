export type UserRole = "user" | "admin" | "demo" | "sandbox"

export type AssignableRole = Extract<UserRole, "user" | "demo">

export interface User {
  id: string
  username: string
  role: UserRole
}
