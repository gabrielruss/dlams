import type { ReactNode } from "react"
import { LogOut, Users } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import RegistrationInviteManager from "@/components/auth/RegistrationInviteManager"
import { useCurrentUser, useLogout } from "@/components/auth/useAuthQueries"
import { isAdmin } from "@/lib/permissions"

interface AppSidebarProps {
  children?: ReactNode
}

function AppSidebar({ children }: AppSidebarProps) {
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()

  return (
    <aside
      aria-label="Application sidebar"
      className="sticky top-0 flex h-screen w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground sm:w-64"
    >
      <Link
        className="flex items-center gap-3 border-b p-4 font-semibold sm:p-5"
        to="/"
        aria-label="DLAMS home"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          D
        </span>
        <span className="text-lg">DLAMS</span>
      </Link>

      {children}

      <div className="mt-auto border-t p-3 sm:p-4">
        <p className="truncate px-2 pb-3 text-sm font-medium">
          {user?.username}
        </p>
        {isAdmin(user) && (
          <>
            <RegistrationInviteManager />
            <Button
              asChild
              className="w-full justify-start aria-[current=page]:bg-accent"
              variant="ghost"
            >
              <NavLink to="/admin/users">
                <Users aria-hidden="true" />
                Manage users
              </NavLink>
            </Button>
          </>
        )}
        {logoutMutation.error && (
          <p role="alert" className="px-2 pb-3 text-sm text-destructive">
            {logoutMutation.error.message}
          </p>
        )}
        <Button
          className="w-full justify-start"
          variant="ghost"
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut aria-hidden="true" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </aside>
  )
}

export default AppSidebar
