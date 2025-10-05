import { Route, Routes, Navigate } from "react-router-dom"

import useAuth from "./stores/auth"
import { Register, Login, Home } from "./pages"
import { useEffect } from "react"

function App() {
  const { user, checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
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
