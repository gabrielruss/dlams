import { useId, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  linkListQueryOptions,
  MAX_LINKS_PER_COLLECTION,
} from "@/lib/api/collectionLinks"
import type { Collection } from "@/types/collections"
import CreateLinkForm from "./CreateLinkForm"
import ShareLinkRow from "./ShareLinkRow"
import useCollectionLinks from "./useCollectionLinks"

interface ShareCollectionDrawerProps {
  collection: Collection
}

function ShareCollectionDrawer({ collection }: ShareCollectionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useQuery(linkListQueryOptions(collection.id))
  const linkCount = data?.links.length ?? 0
  const countId = useId()

  return (
    <Drawer open={isOpen} direction="right" onOpenChange={setIsOpen}>
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
        <DrawerHeader className="flex-row items-center justify-between border-b">
          <DrawerTitle className="text-xl">Share {collection.name}</DrawerTitle>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Close drawer"
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <ShareLinks collectionId={collection.id} />
        </div>
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
        <p role="alert" className="text-sm text-destructive">
          {actionError.message}
        </p>
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
