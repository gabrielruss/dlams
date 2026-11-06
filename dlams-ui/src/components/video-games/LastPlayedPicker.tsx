import { useState } from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { parseISO } from "date-fns"

import { isoDateToMonthDayYear, localDateToIsoDate } from "@/lib/dates"

interface LastPlayedPickerProps {
  id: string
  labelId: string
  value: string
  onChange: (isoDate: string) => void
  invalid?: boolean
}

function LastPlayedPicker({
  id,
  labelId,
  value,
  onChange,
  invalid,
}: LastPlayedPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = value ? parseISO(value) : undefined
  const today = new Date()

  const pick = (date: Date | undefined) => {
    onChange(date ? localDateToIsoDate(date) : "")
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-labelledby={`${labelId} ${id}`}
            aria-invalid={invalid}
            className={`w-full justify-start border-input font-normal ${value ? "" : "text-muted-foreground"}`}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {value ? isoDateToMonthDayYear(value) : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent
        aria-labelledby={labelId}
        className="w-(--anchor-width) p-0"
      >
        <Calendar
          classNames={{ root: "w-full" }}
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={pick}
          disabled={{ after: today }}
          endMonth={today}
          autoFocus
        />
        {value && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => pick(undefined)}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default LastPlayedPicker
