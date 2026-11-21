import { useId, useState } from "react"
import { Link2 } from "lucide-react"

import DrawerBody from "@/components/DrawerBody"
import DrawerTitleBar from "@/components/DrawerTitleBar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { MAX_LINKS_PER_COLLECTION } from "@/features/collections/api/collectionLinks"
import type { Collection } from "@/types/collections"
import CreateLinkForm from "./CreateLinkForm"
import ShareLinkRow from "./ShareLinkRow"
import useCollectionLinks from "./hooks/useCollectionLinks"

interface ShareCollectionDrawerProps {
  collection: Collection
}

function ShareCollectionDrawer({ collection }: ShareCollectionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { links } = useCollectionLinks(collection.id)
  const linkCount = links.length
  const countId = useId()

  return (
    <Drawer open={isOpen} swipeDirection="right" onOpenChange={setIsOpen}>
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <Button
          type="button"
          variant="outline"
          aria-describedby={linkCount > 0 ? countId : undefined}
          onClick={() => setIsOpen(true)}
        >
          <Link2 aria-hidden="true" />
          Share
        </Button>
        {linkCount > 0 && (
          <p id={countId} className="text-xs text-muted-foreground">
            {linkCount} active {linkCount === 1 ? "link" : "links"}
          </p>
        )}
      </div>
      <DrawerContent>
        <DrawerTitleBar title={`Share ${collection.name}`} />
        <DrawerBody>
          <ShareLinks collectionId={collection.id} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

interface ShareLinksProps {
  collectionId: number
}

function ShareLinks({ collectionId }: ShareLinksProps) {
  const { links, isPending, error, createMutation, deleteMutation } =
    useCollectionLinks(collectionId)
  const actionError = createMutation.error ?? deleteMutation.error ?? error

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Anyone with a link can look at your stuff. They can't change it.
      </p>
      <CreateLinkForm
        createMutation={createMutation}
        atLimit={links.length >= MAX_LINKS_PER_COLLECTION}
        disabled={isPending}
      />
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError.message}</AlertDescription>
        </Alert>
      )}
      {isPending ? (
        <p className="text-sm">Loading links...</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No links yet.</p>
      ) : (
        <ul className="divide-y">
          {links.map((link) => (
            <ShareLinkRow
              key={link.id}
              link={link}
              isDeleting={deleteMutation.isPending}
              onDelete={() => {
                createMutation.reset()
                deleteMutation.mutate(link.id)
              }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ShareCollectionDrawer
