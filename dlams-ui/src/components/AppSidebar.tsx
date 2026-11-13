import { useState, type ReactNode } from "react"
import { LogOut, Menu, Users } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import HomeLink from "@/components/HomeLink"
import { Button, buttonVariants } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import RegistrationInviteManager from "@/components/auth/RegistrationInviteManager"
import { useCurrentUser, useLogout } from "@/hooks/useAuthQueries"
import { isAdmin } from "@/lib/permissions"
import { routes } from "@/lib/routes"

interface AppSidebarProps {
  children?: ReactNode
}

function AppSidebar({ children }: AppSidebarProps) {
  const { currentUser } = useCurrentUser()
  const logoutMutation = useLogout()

  const location = useLocation()
  const [menuLocationKey, setMenuLocationKey] = useState<string | null>(null)
  const isMenuOpen = menuLocationKey === location.key

  const menu = (
    <>
      {children}

      <div className="mt-auto border-t p-3 sm:p-4">
        <p className="truncate px-2 pb-3 text-sm font-medium">
          {currentUser?.username}
        </p>
        {isAdmin(currentUser) && (
          <>
            <RegistrationInviteManager />
            <NavLink
              className={buttonVariants({
                variant: "ghost",
                className: "w-full justify-start aria-[current=page]:bg-accent",
              })}
              to={routes.adminUsers}
            >
              <Users aria-hidden="true" />
              Manage users
            </NavLink>
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
          aria-expanded={isMenuOpen}
          onClick={() => setMenuLocationKey(location.key)}
        >
          <Menu aria-hidden="true" />
        </Button>
        <HomeLink
          className="relative block h-9 w-40"
          wordmarkClassName="absolute inset-0"
        />
      </header>

      <Drawer
        open={isMenuOpen}
        swipeDirection="left"
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
        <HomeLink
          className="relative block h-[4.75rem] shrink-0 border-b"
          wordmarkClassName="absolute inset-x-4 inset-y-0"
        />

        {menu}
      </aside>
    </>
  )
}

export default AppSidebar
