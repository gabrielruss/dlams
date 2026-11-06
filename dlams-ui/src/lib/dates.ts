import { format, isAfter, parseISO, startOfToday } from "date-fns"

export function isoDateToMonthDayYear(isoDate: string) {
  return format(parseISO(isoDate), "MM-dd-yyyy")
}

export function localDateToIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function isAfterToday(isoDate: string) {
  return isAfter(parseISO(isoDate), startOfToday())
}
