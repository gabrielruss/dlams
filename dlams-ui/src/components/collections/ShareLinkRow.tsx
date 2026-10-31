import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { shareLinkUrl } from "@/lib/api/collectionLinks"
import type { CollectionLink } from "@/types/collections"

const COPIED_FEEDBACK_MS = 2000

interface ShareLinkRowProps {
  link: CollectionLink
  isDeleting: boolean
  onDelete: () => void
}

function ShareLinkRow({ link, isDeleting, onDelete }: ShareLinkRowProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  )
  const [isConfirming, setIsConfirming] = useState(false)
  const url = shareLinkUrl(link.token)
  const label = link.name ?? "Unnamed link"
  const copied = copyStatus === "copied"

  useEffect(() => {
    if (copyStatus !== "copied") return
    const timer = setTimeout(() => setCopyStatus("idle"), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copyStatus])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus("copied")
    } catch {
      setCopyStatus("failed")
    }
  }

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Created {new Date(link.created_at).toLocaleDateString()}
        </p>
      </div>
      {copyStatus === "failed" && (
        <div role="alert" className="flex flex-col gap-1 text-sm">
          <p>Couldn't copy the link. Select it and copy it yourself:</p>
          <p className="select-all break-all font-medium">{url}</p>
        </div>
      )}
      {isConfirming ? (
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <p className="text-sm">
            Delete this link? People won't be able to look at your stuff
            anymore.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              className="border-destructive text-destructive"
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={onDelete}
            >
              {isDeleting ? "Deleting..." : "Don't Look At My Stuff"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirming(false)}
            >
              Keep link
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label={`Copy link for ${label}`}
            onClick={copyLink}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
          <span role="status" className="sr-only">
            {copied ? "Link copied" : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            aria-label={`Delete link for ${label}`}
            onClick={() => setIsConfirming(true)}
          >
            Delete link
          </Button>
        </div>
      )}
    </li>
  )
}

export default ShareLinkRow
