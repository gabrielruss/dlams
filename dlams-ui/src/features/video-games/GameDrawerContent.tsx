import type { RefObject } from "react"

import DrawerBody from "@/components/DrawerBody"
import DrawerTitleBar from "@/components/DrawerTitleBar"
import ItemActions from "@/components/ItemActions"
import type { GameRecord } from "@/features/video-games/types"
import GameDetails from "./GameDetails"
import GameForm from "./GameForm"
import useGameDrawerContent from "./hooks/useGameDrawerContent"

interface GameDrawerContentProps {
  collectionId: number
  openedGame: GameRecord | undefined
  consoleLabelOptions: string[]
  nameInputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
}

function GameDrawerContent({
  collectionId,
  openedGame,
  consoleLabelOptions,
  nameInputRef,
  onClose,
}: GameDrawerContentProps) {
  const {
    form,
    shownGame,
    isEditing,
    formError,
    deleteError,
    isDeleting,
    isSaving,
    startEditing,
    leaveForm,
    saveGame,
    deleteGame,
  } = useGameDrawerContent({ collectionId, openedGame, onClose })
  const viewedGame = isEditing ? undefined : shownGame

  return (
    <>
      <DrawerTitleBar
        title={viewedGame?.name ?? (shownGame ? "Edit game" : "Add game")}
      />
      {viewedGame ? (
        <DrawerBody>
          <ItemActions
            typeName="game"
            isDeleting={isDeleting}
            deleteError={deleteError}
            onEdit={startEditing}
            onDelete={() => deleteGame(viewedGame)}
          />
          <GameDetails game={viewedGame} />
        </DrawerBody>
      ) : (
        <GameForm
          form={form}
          consoleLabelOptions={consoleLabelOptions}
          isSaving={isSaving}
          focusNameOnMount={shownGame !== undefined}
          nameInputRef={nameInputRef}
          formError={formError}
          onSave={saveGame}
          onCancel={leaveForm}
        />
      )}
    </>
  )
}

export default GameDrawerContent
