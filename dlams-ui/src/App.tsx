import { Route, Routes, Navigate } from "react-router-dom"
import { AdminUsers, Register, Login, Home, SharedCollection } from "./pages"
import { useCurrentUser } from "./components/auth/useAuthQueries"
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
  const currentUserQuery = useCurrentUser()
  const user = currentUserQuery.data

  if (currentUserQuery.isPending) return <p>Checking session...</p>
  if (currentUserQuery.isError) {
    return (
      <main className="p-6">
        <p role="alert" className="text-destructive">
          Could not verify your session: {currentUserQuery.error.message}
        </p>
        <button
          className="mt-3 rounded-md border px-3 py-2"
          type="button"
          onClick={() => currentUserQuery.refetch()}
        >
          Retry
        </button>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/users"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin(user) ? (
            <AdminUsers />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
    </Routes>
  )
}

export default App
