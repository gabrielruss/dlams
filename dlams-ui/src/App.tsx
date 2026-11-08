import { Route, Routes, Navigate } from "react-router-dom"
import { AdminUsers, Register, Login, Home, SharedCollection } from "./pages"
import { useCurrentUser } from "./components/auth/useAuthQueries"
import { Button } from "./components/ui/button"
import { isAdmin } from "./lib/permissions"

function App() {
  return (
    <Routes>
      <Route path="/s/:token" element={<SharedCollection />} />
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
        path="/"
        element={currentUser ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/users"
        element={
          !currentUser ? (
            <Navigate to="/login" replace />
          ) : isAdmin(currentUser) ? (
            <AdminUsers />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/" replace /> : <Register />}
      />
    </Routes>
  )
}

export default App
