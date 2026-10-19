import { useState, type ReactNode } from "react"
import { LogOut, Menu, Users } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"

import Wordmark from "@/components/Wordmark"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import RegistrationInviteManager from "@/components/auth/RegistrationInviteManager"
import { useCurrentUser, useLogout } from "@/components/auth/useAuthQueries"
import { isAdmin } from "@/lib/permissions"

interface AppSidebarProps {
  children?: ReactNode
}

function AppSidebar({ children }: AppSidebarProps) {
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()

  const location = useLocation()
  const [menuLocationKey, setMenuLocationKey] = useState<string | null>(null)
  const isMenuOpen = menuLocationKey === location.key

  const menu = (
    <>
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
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-sidebar px-2 text-sidebar-foreground md:hidden">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuLocationKey(location.key)}
        >
          <Menu aria-hidden="true" />
        </Button>
        <Link
          className="relative block h-9 w-40"
          to="/"
          aria-label="DLAMS home"
        >
          <Wordmark className="absolute inset-0" />
        </Link>
      </header>

      <Drawer
        open={isMenuOpen}
        direction="left"
        onOpenChange={(open: boolean) =>
          setMenuLocationKey(open ? location.key : null)
        }
      >
        <DrawerContent className="bg-sidebar text-sidebar-foreground">
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <div className="flex min-h-0 flex-1 flex-col">{menu}</div>
        </DrawerContent>
      </Drawer>

      <aside
        aria-label="Application sidebar"
        className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground sm:w-64 md:flex"
      >
        <Link
          className="relative block h-[4.75rem] shrink-0 border-b"
          to="/"
          aria-label="DLAMS home"
        >
          <Wordmark className="absolute inset-x-4 inset-y-0" />
        </Link>

        {menu}
      </aside>
    </>
  )
}

export default AppSidebar
