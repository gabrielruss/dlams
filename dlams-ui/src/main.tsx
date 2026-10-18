import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import "@fontsource-variable/fira-code"
import "@fontsource-variable/poltawski-nowy"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
