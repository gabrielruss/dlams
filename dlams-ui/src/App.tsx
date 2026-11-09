import { Route, Routes, Navigate } from "react-router-dom"
import { AdminUsers, Register, Login, Home, SharedCollection } from "./pages"
import { useCurrentUser } from "./components/auth/hooks/useAuthQueries"
import { Button } from "./components/ui/button"
import { isAdmin } from "./lib/permissions"
import { routes } from "./lib/routes"

function App() {
  return (
    <Routes>
      <Route path={routes.sharedCollection} element={<SharedCollection />} />
      <Route path="*" element={<SessionRoutes />} />
    </Routes>
  )
}

function SessionRoutes() {
  const { currentUser, isPending, error, refetch } = useCurrentUser()

  if (isPending) return <p>Checking session...</p>
  if (error) {
    return (
      <main className="p-6">
        <p role="alert" className="text-destructive">
          Could not verify your session: {error.message}
        </p>
        <Button
          className="mt-3"
          type="button"
          variant="outline"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path={routes.home}
        element={
          currentUser ? <Home /> : <Navigate to={routes.login} replace />
        }
      />
      <Route
        path={routes.adminUsers}
        element={
          !currentUser ? (
            <Navigate to={routes.login} replace />
          ) : isAdmin(currentUser) ? (
            <AdminUsers />
          ) : (
            <Navigate to={routes.home} replace />
          )
        }
      />
      <Route
        path={routes.login}
        element={
          currentUser ? <Navigate to={routes.home} replace /> : <Login />
        }
      />
      <Route
        path={routes.register}
        element={
          currentUser ? <Navigate to={routes.home} replace /> : <Register />
        }
      />
    </Routes>
  )
}

export default App
