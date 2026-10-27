import { useState } from "react"
import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { isDemo } from "@/lib/permissions"
import CollectionStats from "./CollectionStats"
import useCollections from "./useCollections"

function CollectionNavigation() {
  const {
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    collectionsQuery,
    createCollectionMutation,
  } = useCollections()
  const { data: user } = useCurrentUser()
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
  const newCollectionName = form.watch("name")

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false)
    form.reset()
    createCollectionMutation.reset()
  }

  const openCreateDrawer = () => {
    createCollectionMutation.reset()
    setIsCreateDrawerOpen(true)
  }

  const handleCreateCollection = ({ name }: { name: string }) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    createCollectionMutation.mutate(trimmedName, {
      onSuccess: () => {
        form.reset()
        setIsCreateDrawerOpen(false)
      },
    })
  }

  return (
    <nav
      aria-label="Collections"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between py-2 pl-3 pr-3">
        <h2 className="text-sm font-semibold">Collections</h2>
        {!isDemo(user) && (
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="New collection"
            title="New collection"
            onClick={openCreateDrawer}
          >
            <Plus aria-hidden="true" />
          </Button>
        )}
      </div>

      {collectionsQuery.isError && (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          {collectionsQuery.error.message}
        </p>
      )}

      {collectionsQuery.isPending ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <div className="flex flex-col gap-3 px-3 py-2">
          <p className="text-sm text-muted-foreground">No collections yet.</p>
          {!isDemo(user) && (
            <Button variant="outline" type="button" onClick={openCreateDrawer}>
              Create your first collection
            </Button>
          )}
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pl-3">
          {collections.map((collection) => {
            const selected = collection.id === selectedCollectionId
            return (
              <li key={collection.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`flex w-full flex-col gap-2 border-r-4 py-3 pr-3 text-left transition-colors ${
                    selected
                      ? "border-red text-sidebar-primary"
                      : "border-transparent text-sidebar-foreground hover:text-sidebar-primary"
                  }`}
                >
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {collection.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                      {collection.access}
                    </span>
                  </span>
                  <CollectionStats collection={collection} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Drawer
        open={isCreateDrawerOpen}
        direction="right"
        onOpenChange={(open: boolean) => {
          if (!open) closeCreateDrawer()
        }}
      >
        <DrawerContent>
          <DrawerHeader className="flex-row items-center justify-between border-b">
            <DrawerTitle className="text-xl">Create collection</DrawerTitle>
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
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <form
              onSubmit={form.handleSubmit(handleCreateCollection)}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                Collection name
                <input
                  className="h-9 rounded-md border bg-background px-3"
                  {...form.register("name", {
                    required: "Collection name is required",
                    maxLength: {
                      value: 100,
                      message: "Collection name must be 100 characters or fewer",
                    },
                  })}
                  autoFocus
                />
              </label>
              {form.formState.errors.name && (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
              {createCollectionMutation.error && (
                <p role="alert" className="text-sm text-destructive">
                  {createCollectionMutation.error.message}
                </p>
              )}
              <button
                className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
                type="submit"
                disabled={
                  createCollectionMutation.isPending ||
                  !newCollectionName.trim()
                }
              >
                {createCollectionMutation.isPending
                  ? "Creating..."
                  : "Create collection"}
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}

export default CollectionNavigation
