import { useState } from "react"
import { UserPlus } from "lucide-react"

import { useCreateRegistrationInvitation } from "@/components/auth/useAuthQueries"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"

function RegistrationInviteManager() {
  const invitationMutation = useCreateRegistrationInvitation()
  const [isOpen, setIsOpen] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const invitation = invitationMutation.data
  const invitationUrl = invitation
    ? `${window.location.origin}/register#invite=${encodeURIComponent(
        invitation.invitation_code
      )}`
    : ""

  const createInvitation = () => {
    invitationMutation.reset()
    setCopied(false)
    setCopyError(null)
    invitationMutation.mutate()
  }

  const copyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      setCopyError(null)
    } catch (error) {
      setCopyError(
        error instanceof Error ? error.message : "Could not copy invitation link"
      )
    }
  }

  return (
    <>
      <Button
        className="w-full justify-start"
        variant="ghost"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <UserPlus aria-hidden="true" />
        Invite someone
      </Button>
      <Drawer open={isOpen} direction="right" onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader className="flex-row items-center justify-between border-b">
            <DrawerTitle className="text-xl">Invite someone</DrawerTitle>
            <DrawerClose asChild>
              <button
                className="rounded-md border px-3 py-2 text-sm md:py-1"
                type="button"
                aria-label="Close drawer"
              >
                Close
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
            <p className="text-sm text-muted-foreground">
              Each invitation can create one account and expires after seven
              days.
            </p>
            <Button
              type="button"
              onClick={createInvitation}
              disabled={invitationMutation.isPending}
            >
              {invitationMutation.isPending
                ? "Creating invitation..."
                : "Create invitation"}
            </Button>
            {invitationMutation.error && (
              <p role="alert" className="text-sm text-destructive">
                {invitationMutation.error.message}
              </p>
            )}
            {invitation && (
              <>
                <label className="flex flex-col gap-2 text-sm">
                  Invitation link (copy and share)
                  <Input
                    readOnly
                    value={invitationUrl}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Expires {new Date(invitation.expires_at).toLocaleString()}
                </p>
                <Button type="button" variant="outline" onClick={copyInvitation}>
                  {copied ? "Invitation link copied" : "Copy invitation link"}
                </Button>
                {copyError && (
                  <p role="alert" className="text-sm text-destructive">
                    {copyError}
                  </p>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default RegistrationInviteManager
