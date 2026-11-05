import type { RefObject } from "react"

import ItemActions from "@/components/collections/ItemActions"
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import type { ConsoleRecord } from "@/types/videoGames"
import ConsoleDetails from "./ConsoleDetails"
import ConsoleForm from "./ConsoleForm"
import useConsoleDrawerContent from "./useConsoleDrawerContent"

interface ConsoleDrawerContentProps {
  collectionId: number
  openedConsole: ConsoleRecord | undefined
  consoleLabelOptions: string[]
  popupContainer: RefObject<HTMLElement | null>
  onClose: () => void
}

function ConsoleDrawerContent({
  collectionId,
  openedConsole,
  consoleLabelOptions,
  popupContainer,
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
            <button
              className="rounded-md border px-3 py-2 text-sm md:py-1"
              type="button"
              aria-label="Close drawer"
            />
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
          popupContainer={popupContainer}
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
