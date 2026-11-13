import { lazy, Suspense } from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import { useCurrentUser } from "@/hooks/useAuthQueries"
import { Button } from "./components/ui/button"
import { isAdmin } from "./lib/permissions"
import { routes } from "./lib/routes"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const AdminUsers = lazy(() => import("./pages/AdminUsers"))
const SharedCollection = lazy(() => import("./pages/SharedCollection"))

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path={routes.sharedCollection} element={<SharedCollection />} />
        <Route path="*" element={<SessionRoutes />} />
      </Routes>
    </Suspense>
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
