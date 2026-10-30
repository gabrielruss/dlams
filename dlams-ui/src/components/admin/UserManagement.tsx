import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { Button } from "@/components/ui/button"
import { isAdmin, isTemplate } from "@/lib/permissions"
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
        and you can reactivate them at any time. "Try the demo" copies the
        template account into a temporary sandbox account for each visitor.
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
            ? isTemplate(completedAction.user)
              ? "a template account"
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
              const isTemplateAccount = isTemplate(user)
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
                              isTemplateAccount ? "regular" : "template"
                            } account`}
                            onClick={() =>
                              applyAction({
                                kind: "role",
                                userId: user.id,
                                role: isTemplateAccount ? "user" : "template",
                              })
                            }
                          >
                            {isPendingAction && pendingKind === "role"
                              ? "Saving..."
                              : isTemplateAccount
                                ? "Make regular"
                                : "Make template"}
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
