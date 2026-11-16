export interface ItemDetailRow {
  label: string
  value: string | null
}

interface ItemDetailRowsProps {
  rows: ItemDetailRow[]
}

function ItemDetailRows({ rows }: ItemDetailRowsProps) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1">
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  )
}

export default ItemDetailRows
