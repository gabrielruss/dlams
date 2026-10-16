import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { Button } from "@/components/ui/button"
import { isAdmin, isDemo } from "@/lib/permissions"
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
    applyAction,
    pendingUserId,
    pendingKind,
    actionError,
    completedAction,
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
        and you can reactivate them at any time. Demo accounts are read-only:
        they can sign in and look around, but the server rejects any change
        they make.
      </p>
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError.message}
        </p>
      )}
      {completedAction && (
        <p role="status" className="text-sm">
          {completedAction.user.username} is now{" "}
          {completedAction.kind === "role"
            ? isDemo(completedAction.user)
              ? "a demo account"
              : "a regular account"
            : completedAction.user.is_active
              ? "active"
              : "deactivated"}
          .
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
              const isPendingAction = pendingUserId === user.id
              const isDemoAccount = isDemo(user)
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
                      <div className="flex justify-end gap-2">
                        {!isAdmin(user) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPendingAction}
                            aria-label={`Make ${user.username} a ${
                              isDemoAccount ? "regular" : "demo"
                            } account`}
                            onClick={() =>
                              applyAction({
                                kind: "role",
                                userId: user.id,
                                role: isDemoAccount ? "user" : "demo",
                              })
                            }
                          >
                            {isPendingAction && pendingKind === "role"
                              ? "Saving..."
                              : isDemoAccount
                                ? "Make regular"
                                : "Make demo"}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPendingAction}
                          aria-label={`${
                            user.is_active ? "Deactivate" : "Reactivate"
                          } ${user.username}`}
                          onClick={() =>
                            applyAction({
                              kind: "status",
                              userId: user.id,
                              active: !user.is_active,
                            })
                          }
                        >
                          {isPendingAction && pendingKind === "status"
                            ? "Saving..."
                            : user.is_active
                              ? "Deactivate"
                              : "Reactivate"}
                        </Button>
                      </div>
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
