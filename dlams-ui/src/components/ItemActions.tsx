import { Pencil, Trash2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ItemActionsProps {
  typeName: string
  isDeleting: boolean
  deleteError: string | null
  onEdit: () => void
  onDelete: () => void
}

function ItemActions({
  typeName,
  isDeleting,
  deleteError,
  onEdit,
  onDelete,
}: ItemActionsProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          aria-label={`Delete ${typeName}`}
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ItemActions
