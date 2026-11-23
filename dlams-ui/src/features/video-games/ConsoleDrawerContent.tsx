import DrawerBody from "@/components/DrawerBody"
import DrawerTitleBar from "@/components/DrawerTitleBar"
import ItemActions from "@/components/ItemActions"
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
      <DrawerTitleBar
        title={
          viewedConsole?.label ??
          (shownConsole ? "Edit console" : "Add console")
        }
      />
      {viewedConsole ? (
        <DrawerBody>
          <ItemActions
            typeName="console"
            isDeleting={isDeleting}
            deleteError={deleteError}
            onEdit={startEditing}
            onDelete={() => deleteConsole(viewedConsole)}
          />
          <ConsoleDetails consoleRecord={viewedConsole} />
        </DrawerBody>
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
