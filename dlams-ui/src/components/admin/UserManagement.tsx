import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useAdminUsers from "./useAdminUsers"

function UserManagement() {
  const { data: currentUser } = useCurrentUser()
  const {
    users,
    isPending,
    isError,
    error,
    setUserActive,
    pendingUserId,
    changeError,
    changedUser,
  } = useAdminUsers()

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error?.message ?? "Could not load users"}
      </p>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Deactivated users can no longer log in, and lose access the next time
        they take an action or refresh. Their collections and data are kept,
        and you can reactivate them at any time.
      </p>
      {changeError && (
        <p role="alert" className="text-sm text-destructive">
          {changeError.message}
        </p>
      )}
      {changedUser && (
        <p role="status" className="text-sm">
          {changedUser.username} is now{" "}
          {changedUser.is_active ? "active" : "deactivated"}.
        </p>
      )}
      <div className="rounded-lg border">
        <Table>
          <TableCaption className="sr-only">Users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Username</TableHead>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead scope="col">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.username === currentUser?.username
              const isPendingChange = pendingUserId === user.id
              return (
                <TableRow key={user.id}>
                  <TableHead scope="row">
                    {user.username}
                    {isSelf && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </TableHead>
                  <TableCell>{user.role}</TableCell>
                  <TableCell
                    className={user.is_active ? "" : "text-muted-foreground"}
                  >
                    {user.is_active ? "Active" : "Deactivated"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {isSelf ? null : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPendingChange}
                        aria-label={`${
                          user.is_active ? "Deactivate" : "Reactivate"
                        } ${user.username}`}
                        onClick={() =>
                          setUserActive({
                            userId: user.id,
                            active: !user.is_active,
                          })
                        }
                      >
                        {isPendingChange
                          ? "Saving..."
                          : user.is_active
                            ? "Deactivate"
                            : "Reactivate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export default UserManagement
