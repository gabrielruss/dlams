import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { ITEM_PARAM, itemParamValue, parseItemParam } from "@/lib/urlParams"
import type { ItemType } from "@/types/items"

function openedFromList(state: unknown) {
  return (
    typeof state === "object" &&
    state !== null &&
    "openedFromList" in state &&
    state.openedFromList === true
  )
}

function useOpenItem(type: ItemType) {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openItemId = parseItemParam(searchParams.get(ITEM_PARAM), type)

  const openItem = (itemId: number) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(ITEM_PARAM, itemParamValue(type, itemId))
        return next
      },
      { state: { openedFromList: true } },
    )
  }

  const closeItem = () => {
    if (openedFromList(location.state)) {
      navigate(-1)
      return
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete(ITEM_PARAM)
        return next
      },
      { replace: true },
    )
  }

  return { openItemId, openItem, closeItem }
}

export default useOpenItem
