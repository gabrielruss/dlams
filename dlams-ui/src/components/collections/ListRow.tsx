import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ListRowProps {
  title: string
  children: ReactNode
  onSelect?: () => void
}

function ListRow({ title, children, onSelect }: ListRowProps) {
  const text = (
    <div className="min-w-0">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )

  if (!onSelect) return <div className="py-3">{text}</div>

  return (
    <Button
      className="-mx-2 h-auto w-[calc(100%+1rem)] justify-between gap-3 px-2 py-3 text-left text-base font-normal whitespace-normal"
      type="button"
      variant="ghost"
      aria-label={`Edit ${title}`}
      onClick={onSelect}
    >
      {text}
      <ChevronRight aria-hidden="true" className="text-muted-foreground" />
    </Button>
  )
}

export default ListRow
