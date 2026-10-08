import { useState } from "react"
import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"
import type { ReactNode } from "react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { Collection } from "@/types/collections"

interface CollectionNavigationProps {
  collections: Collection[]
  renderStats: (collection: Collection) => ReactNode
  selectedCollectionId: number | undefined
  setSelectedCollectionId: (id: number | undefined) => void
  isLoading: boolean
  statsError: string | null
  isCreating: boolean
  createError: string | null
  clearCreateError: () => void
  createCollection: (name: string) => Promise<boolean>
  onCollectionCreated: () => Promise<void>
}

function CollectionNavigation({
  collections,
  renderStats,
  selectedCollectionId,
  setSelectedCollectionId,
  isLoading,
  statsError,
  isCreating,
  createError,
  clearCreateError,
  createCollection,
  onCollectionCreated,
}: CollectionNavigationProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
  const newCollectionName = form.watch("name")

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false)
    form.reset()
    clearCreateError()
  }

  const handleCreateCollection = async ({ name }: { name: string }) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (await createCollection(trimmedName)) {
      await onCollectionCreated()
      form.reset()
      setIsCreateDrawerOpen(false)
    }
  }

  return (
    <nav
      aria-label="Collections"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 p-3 pb-2">
        <h2 className="text-sm font-semibold">Collections</h2>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          type="button"
          onClick={() => {
            clearCreateError()
            setIsCreateDrawerOpen(true)
          }}
        >
          <Plus aria-hidden="true" className="size-4" />
          New collection
        </button>
      </div>

      {statsError && (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          Could not refresh collection stats: {statsError}
        </p>
      )}

      {isLoading && collections.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          No collections yet.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-3">
          {collections.map((collection) => {
            const selected = collection.id === selectedCollectionId
            return (
              <li key={collection.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`flex w-full flex-col gap-2 py-3 text-left transition-colors ${
                    selected
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground hover:text-sidebar-primary"
                  }`}
                >
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {collection.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {collection.access}
                    </span>
                  </span>
                  {renderStats(collection)}
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
                className="rounded-md border px-3 py-1 text-sm"
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
              {createError && (
                <p role="alert" className="text-sm text-destructive">
                  {createError}
                </p>
              )}
              <button
                className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
                type="submit"
                disabled={isCreating || !newCollectionName.trim()}
              >
                {isCreating ? "Creating..." : "Create collection"}
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}

export default CollectionNavigation
