import { useState, type ReactNode } from "react"
import { LogOut, Menu, Users } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import RegistrationInviteManager from "@/features/auth/RegistrationInviteManager"
import { useCurrentUser, useLogout } from "@/hooks/useAuthQueries"
import { isAdmin } from "@/lib/permissions"
import { routes } from "@/lib/routes"
import SidebarFrame from "./SidebarFrame"

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
              <Users data-icon="inline-start" aria-hidden="true" />
              Manage users
            </NavLink>
          </>
        )}
        {logoutMutation.error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{logoutMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <Button
          className="w-full justify-start"
          variant="ghost"
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut data-icon="inline-start" aria-hidden="true" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </>
  )

  return (
    <>
      <SidebarFrame
        label="Application sidebar"
        headerStart={
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
        }
      >
        {menu}
      </SidebarFrame>

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
    </>
  )
}

export default AppSidebar
