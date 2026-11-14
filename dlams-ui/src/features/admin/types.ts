import type { UserRole } from "@/types/user"

export interface AdminUser {
  id: number
  username: string
  role: UserRole
  is_active: boolean
  created_at: string
}
