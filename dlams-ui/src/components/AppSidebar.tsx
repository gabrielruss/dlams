import { type ReactNode, useState } from "react"
import { LogOut } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import useAuth from "@/stores/auth"

interface AppSidebarProps {
  children: ReactNode
}

function AppSidebar({ children }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLogoutError(null)
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not log out"
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

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
        {logoutError && (
          <p role="alert" className="px-2 pb-3 text-sm text-destructive">
            {logoutError}
          </p>
        )}
        <Button
          className="w-full justify-start"
          variant="ghost"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </aside>
  )
}

export default AppSidebar
