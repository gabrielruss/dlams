import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import AppSidebar from "@/components/AppSidebar"
import UserManagement from "@/components/admin/UserManagement"

function AdminUsers() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
          <Link
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to collections
          </Link>
          <header>
            <h1 className="text-3xl font-semibold">Users</h1>
          </header>
          <UserManagement />
        </div>
      </main>
    </div>
  )
}

export default AdminUsers
