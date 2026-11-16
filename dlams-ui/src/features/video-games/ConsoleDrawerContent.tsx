import ItemActions from "@/components/ItemActions"
import { Button } from "@/components/ui/button"
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import type { ConsoleRecord } from "@/features/video-games/types"
import ConsoleDetails from "./ConsoleDetails"
import ConsoleForm from "./ConsoleForm"
import useConsoleDrawerContent from "./hooks/useConsoleDrawerContent"

interface ConsoleDrawerContentProps {
  collectionId: number
  openedConsole: ConsoleRecord | undefined
  consoleLabelOptions: string[]
  onClose: () => void
}

function ConsoleDrawerContent({
  collectionId,
  openedConsole,
  consoleLabelOptions,
  onClose,
}: ConsoleDrawerContentProps) {
  const {
    form,
    shownConsole,
    isEditing,
    formError,
    deleteError,
    isDeleting,
    isSaving,
    startEditing,
    leaveForm,
    saveConsole,
    deleteConsole,
  } = useConsoleDrawerContent({ collectionId, openedConsole, onClose })
  const viewedConsole = isEditing ? undefined : shownConsole

  return (
    <>
      <DrawerHeader className="flex-row items-center justify-between border-b pb-4">
        <DrawerTitle className="text-xl">
          {viewedConsole?.label ??
            (shownConsole ? "Edit console" : "Add console")}
        </DrawerTitle>
        <DrawerClose
          render={
            <Button type="button" variant="outline" aria-label="Close drawer" />
          }
        >
          Close
        </DrawerClose>
      </DrawerHeader>
      {viewedConsole ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <ItemActions
            typeName="console"
            isDeleting={isDeleting}
            deleteError={deleteError}
            onEdit={startEditing}
            onDelete={() => deleteConsole(viewedConsole)}
          />
          <ConsoleDetails consoleRecord={viewedConsole} />
        </div>
      ) : (
        <ConsoleForm
          form={form}
          consoleLabelOptions={consoleLabelOptions}
          isSaving={isSaving}
          formError={formError}
          onSave={saveConsole}
          onCancel={leaveForm}
        />
      )}
    </>
  )
}

export default ConsoleDrawerContent
