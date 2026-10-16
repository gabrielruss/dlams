export type UserRole = "user" | "admin" | "demo"

// Roles an admin can assign from user management. Never "admin".
export type AssignableRole = Extract<UserRole, "user" | "demo">

export interface User {
  id: string
  username: string
  role: UserRole
}
