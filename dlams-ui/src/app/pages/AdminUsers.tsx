import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import PageHeading from "@/components/PageHeading"
import AppSidebar from "@/app/AppSidebar"
import PageShell from "@/app/PageShell"
import UserManagement from "@/features/admin/UserManagement"
import { routes } from "@/lib/routes"

function AdminUsers() {
  return (
    <PageShell sidebar={<AppSidebar />}>
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        to={routes.home}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to collections
      </Link>
      <header>
        <PageHeading>Users</PageHeading>
      </header>
      <UserManagement />
    </PageShell>
  )
}

export default AdminUsers
